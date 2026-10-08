// RealtimeService.ts
// npm i socket.io-client
import { io, Socket } from 'socket.io-client';

// ───────── Types ─────────

export type ReportType = 'accident' | 'police' | 'traffic_jam' | 'hazard' | 'road_closed';

export interface ReportDraft {
  type: ReportType;
  latitude: number;
  longitude: number;
}

export interface Report extends ReportDraft {
  id: string;
  reporterId: string;
  confirmations: number;
  createdAt: number;  // epoch ms
  expiresAt: number;  // epoch ms
}

type AckResult<T> = { ok: true; data: T } | { ok: false; error: string };

interface ServerToClientEvents {
  'report:created': (report: Report) => void;
  'report:updated': (report: Report) => void;
  'report:removed': (payload: { id: string }) => void;
}

interface ClientToServerEvents {
  'area:join': (areaId: string) => void;
  'area:leave': (areaId: string) => void;
  'report:create': (draft: ReportDraft, ack: (res: AckResult<Report>) => void) => void;
  'report:confirm': (id: string, ack: (res: AckResult<Report>) => void) => void;
}

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
type Listener<T> = (payload: T) => void;

// ───────── Geo-areas (grid cells, ~5.5km) ─────────
// The server only broadcasts reports to sockets subscribed to the cell.

const AREA_SIZE_DEG = 0.05;

export function getAreaId(lat: number, lng: number): string {
  return `${Math.floor(lat / AREA_SIZE_DEG)}:${Math.floor(lng / AREA_SIZE_DEG)}`;
}

/** The driver's cell plus its 8 neighbours, so reports just outside the cell still arrive. */
export function getNearbyAreaIds(lat: number, lng: number): string[] {
  const row = Math.floor(lat / AREA_SIZE_DEG);
  const col = Math.floor(lng / AREA_SIZE_DEG);
  const ids: string[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      ids.push(`${row + dr}:${col + dc}`);
    }
  }
  return ids;
}

// ───────── Service ─────────

const ACK_TIMEOUT_MS = 8000;

class RealtimeService {
  private socket: TypedSocket | null = null;
  private desiredAreas = new Set<string>();
  private outbox: Array<(s: TypedSocket) => void> = [];

  private createdListeners = new Set<Listener<Report>>();
  private updatedListeners = new Set<Listener<Report>>();
  private removedListeners = new Set<Listener<{ id: string }>>();
  private connectionListeners = new Set<Listener<boolean>>();

  // ── Connection lifecycle ──

  connect(url: string, authToken: string): void {
    if (this.socket) return;

    const socket: TypedSocket = io(url, {
      transports: ['websocket'], // avoids long-polling quirks on React Native
      auth: { token: authToken },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      // Re-subscribe to every area we care about after (re)connecting.
      this.desiredAreas.forEach(id => socket.emit('area:join', id));
      this.flushOutbox(socket);
      this.emitConnection(true);
    });

    socket.on('disconnect', () => this.emitConnection(false));

    socket.on('connect_error', err => {
      console.warn('[Realtime] connect_error:', err.message);
    });

    socket.on('report:created', r => this.createdListeners.forEach(l => l(r)));
    socket.on('report:updated', r => this.updatedListeners.forEach(l => l(r)));
    socket.on('report:removed', p => this.removedListeners.forEach(l => l(p)));

    this.socket = socket;
  }

  disconnect(): void {
    if (!this.socket) return;
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    this.desiredAreas.clear();
    this.outbox = [];
    this.emitConnection(false);
  }

  get isConnected(): boolean {
    return !!this.socket?.connected;
  }

  // ── Location-based subscriptions ──

  /** Call on every significant location update. Joins/leaves areas as the driver moves. */
  updateLocation(lat: number, lng: number): void {
    const wanted = new Set(getNearbyAreaIds(lat, lng));

    for (const id of this.desiredAreas) {
      if (!wanted.has(id)) {
        this.desiredAreas.delete(id);
        if (this.isConnected) this.socket!.emit('area:leave', id);
      }
    }
    for (const id of wanted) {
      if (!this.desiredAreas.has(id)) {
        this.desiredAreas.add(id);
        if (this.isConnected) this.socket!.emit('area:join', id);
      }
    }
  }

  // ── Outgoing actions (queued while offline) ──

  createReport(draft: ReportDraft): Promise<Report> {
    return this.send<Report>((s, done) =>
      s.timeout(ACK_TIMEOUT_MS).emit('report:create', draft, (err: Error | null, res?: AckResult<Report>) =>
        done(err, res),
      ),
    );
  }

  confirmReport(id: string): Promise<Report> {
    return this.send<Report>((s, done) =>
      s.timeout(ACK_TIMEOUT_MS).emit('report:confirm', id, (err: Error | null, res?: AckResult<Report>) =>
        done(err, res),
      ),
    );
  }

  /**
   * Sends immediately if connected; otherwise holds the action until the socket reconnects.
   * Resolves or rejects when the server acknowledges (or the ack times out).
   */
  private send<T>(
    run: (s: TypedSocket, done: (err: Error | null, res?: AckResult<T>) => void) => void,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const attempt = (s: TypedSocket) =>
        run(s, (err, res) => {
          if (err) return reject(new Error('timeout: no response from server'));
          if (!res) return reject(new Error('empty response'));
          res.ok ? resolve(res.data) : reject(new Error(res.error));
        });

      if (this.isConnected) attempt(this.socket!);
      else this.outbox.push(attempt);
    });
  }

  private flushOutbox(s: TypedSocket): void {
    const pending = this.outbox.splice(0);
    pending.forEach(attempt => attempt(s));
  }

  // ── Incoming subscriptions (each returns an unsubscribe function) ──

  onReportCreated(fn: Listener<Report>): () => void {
    this.createdListeners.add(fn);
    return () => this.createdListeners.delete(fn);
  }

  onReportUpdated(fn: Listener<Report>): () => void {
    this.updatedListeners.add(fn);
    return () => this.updatedListeners.delete(fn);
  }

  onReportRemoved(fn: Listener<{ id: string }>): () => void {
    this.removedListeners.add(fn);
    return () => this.removedListeners.delete(fn);
  }

  onConnectionChange(fn: Listener<boolean>): () => void {
    this.connectionListeners.add(fn);
    return () => this.connectionListeners.delete(fn);
  }

  private emitConnection(connected: boolean): void {
    this.connectionListeners.forEach(l => l(connected));
  }
}

export const realtimeService = new RealtimeService();
