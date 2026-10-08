"use strict";

import React from 'react';
import NativePointAnnotationManager from '../specs/RNMBXPointAnnotationManagerNativeComponent';
import PointAnnotation from "./PointAnnotation.js";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Configures a PointAnnotation manager. Each PointAnnotationManager owns its own
 * annotation layer, so multiple managers can be placed in different `slot`s of the
 * Mapbox Standard style. Wrap PointAnnotation components as children.
 *
 * PointAnnotations that are not wrapped in a PointAnnotationManager attach to a
 * default manager. Use `default` to configure that manager.
 */
const PointAnnotationManager = props => {
  const {
    children,
    default: isDefault,
    slot,
    ...rest
  } = props;
  if (__DEV__) {
    React.Children.forEach(children, child => {
      if (/*#__PURE__*/React.isValidElement(child) && child.type !== PointAnnotation) {
        console.warn('PointAnnotationManager: only PointAnnotation components should be direct children.');
      }
    });
  }
  return /*#__PURE__*/_jsx(NativePointAnnotationManager, {
    ...rest,
    isDefault: isDefault,
    slot: slot,
    children: children
  });
};
export default PointAnnotationManager;
//# sourceMappingURL=PointAnnotationManager.js.map