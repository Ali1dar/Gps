// The background task MUST be registered at module scope, before the app mounts.
import './src/services/location/backgroundTask';
import { registerRootComponent } from 'expo';
import App from './src/App';

registerRootComponent(App);
