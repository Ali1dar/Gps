import type { HostComponent, ViewProps } from 'react-native';
import type { UnsafeMixed } from './codegenUtils';
type OptionalProp<T> = UnsafeMixed<T>;
type Slot = 'bottom' | 'middle' | 'top';
export interface NativeProps extends ViewProps {
    /** Stable Mapbox layer id for this manager. When omitted the SDK generates one. */
    id?: OptionalProp<string>;
    /** Marks this as the manager used by PointAnnotations not wrapped in a manager. */
    isDefault?: OptionalProp<boolean>;
    slot?: OptionalProp<Slot>;
    iconAllowOverlap?: OptionalProp<boolean>;
    iconIgnorePlacement?: OptionalProp<boolean>;
    iconOptional?: OptionalProp<boolean>;
    textAllowOverlap?: OptionalProp<boolean>;
    textIgnorePlacement?: OptionalProp<boolean>;
    textOptional?: OptionalProp<boolean>;
}
declare const _default: HostComponent<NativeProps>;
export default _default;
//# sourceMappingURL=RNMBXPointAnnotationManagerNativeComponent.d.ts.map