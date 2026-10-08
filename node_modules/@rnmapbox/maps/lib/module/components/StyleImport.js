"use strict";

import { memo } from 'react';
import NativeStyleImport from '../specs/RNMBXStyleImportNativeComponent';

/**
 * Configuration options for the Mapbox Standard style.
 *
 * These options are available when using `StyleImport` with `id="basemap"` and
 * a Standard style URL (e.g., `mapbox://styles/mapbox/standard`).
 */
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Use StyleImport to set configuration options on the new standard style. **V11 only.**
 *
 * See https://github.com/mapbox/mapbox-maps-ios/blob/main/Sources/MapboxMaps/Documentation.docc/Migrate%20to%20v11.md#21-the-mapbox-standard-style
 */
export default /*#__PURE__*/memo(props => {
  return /*#__PURE__*/_jsx(NativeStyleImport, {
    ...props,
    config: props.config
  });
});
//# sourceMappingURL=StyleImport.js.map