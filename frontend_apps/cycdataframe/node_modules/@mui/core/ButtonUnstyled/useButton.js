import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { unstable_useEventCallback as useEventCallback, unstable_useForkRef as useForkRef, unstable_useIsFocusVisible as useIsFocusVisible } from '@mui/utils';
import extractEventHandlers from '../utils/extractEventHandlers';
export default function useButton(props) {
  var _ref;

  const {
    component,
    components = {},
    disabled = false,
    href,
    ref,
    tabIndex = 0,
    to,
    type
  } = props;
  const buttonRef = React.useRef();
  const [active, setActive] = React.useState(false);
  const {
    isFocusVisibleRef,
    onFocus: handleFocusVisible,
    onBlur: handleBlurVisible,
    ref: focusVisibleRef
  } = useIsFocusVisible();
  const [focusVisible, setFocusVisible] = React.useState(false);

  if (disabled && focusVisible) {
    setFocusVisible(false);
  }

  React.useEffect(() => {
    isFocusVisibleRef.current = focusVisible;
  }, [focusVisible, isFocusVisibleRef]);

  const handleMouseLeave = otherHandlers => event => {
    var _otherHandlers$onMous;

    if (focusVisible) {
      event.preventDefault();
    }

    (_otherHandlers$onMous = otherHandlers.onMouseLeave) == null ? void 0 : _otherHandlers$onMous.call(otherHandlers, event);
  };

  const handleBlur = otherHandlers => event => {
    var _otherHandlers$onBlur;

    handleBlurVisible(event);

    if (isFocusVisibleRef.current === false) {
      setFocusVisible(false);
    }

    (_otherHandlers$onBlur = otherHandlers.onBlur) == null ? void 0 : _otherHandlers$onBlur.call(otherHandlers, event);
  };

  const handleFocus = useEventCallback(otherHandlers => event => {
    var _otherHandlers$onFocu2;

    // Fix for https://github.com/facebook/react/issues/7769
    if (!buttonRef.current) {
      buttonRef.current = event.currentTarget;
    }

    handleFocusVisible(event);

    if (isFocusVisibleRef.current === true) {
      var _otherHandlers$onFocu;

      setFocusVisible(true);
      (_otherHandlers$onFocu = otherHandlers.onFocusVisible) == null ? void 0 : _otherHandlers$onFocu.call(otherHandlers, event);
    }

    (_otherHandlers$onFocu2 = otherHandlers.onFocus) == null ? void 0 : _otherHandlers$onFocu2.call(otherHandlers, event);
  });
  const elementType = (_ref = component != null ? component : components.Root) != null ? _ref : 'button';

  const isNonNativeButton = () => {
    const button = buttonRef.current;
    return elementType !== 'button' && !((button == null ? void 0 : button.tagName) === 'A' && button != null && button.href);
  };

  const handleMouseDown = otherHandlers => event => {
    var _otherHandlers$onMous2;

    if (event.target === event.currentTarget && !disabled) {
      setActive(true);
    }

    (_otherHandlers$onMous2 = otherHandlers.onMouseDown) == null ? void 0 : _otherHandlers$onMous2.call(otherHandlers, event);
  };

  const handleMouseUp = otherHandlers => event => {
    var _otherHandlers$onMous3;

    if (event.target === event.currentTarget) {
      setActive(false);
    }

    (_otherHandlers$onMous3 = otherHandlers.onMouseUp) == null ? void 0 : _otherHandlers$onMous3.call(otherHandlers, event);
  };

  const handleKeyDown = useEventCallback(otherHandlers => event => {
    var _otherHandlers$onKeyD;

    if (event.target === event.currentTarget && isNonNativeButton() && event.key === ' ') {
      event.preventDefault();
    }

    if (event.target === event.currentTarget && event.key === ' ' && !disabled) {
      setActive(true);
    }

    (_otherHandlers$onKeyD = otherHandlers.onKeyDown) == null ? void 0 : _otherHandlers$onKeyD.call(otherHandlers, event); // Keyboard accessibility for non interactive elements

    if (event.target === event.currentTarget && isNonNativeButton() && event.key === 'Enter' && !disabled) {
      var _otherHandlers$onClic;

      event.preventDefault();
      (_otherHandlers$onClic = otherHandlers.onClick) == null ? void 0 : _otherHandlers$onClic.call(otherHandlers, event);
    }
  });
  const handleKeyUp = useEventCallback(otherHandlers => event => {
    var _otherHandlers$onKeyU;

    // calling preventDefault in keyUp on a <button> will not dispatch a click event if Space is pressed
    // https://codesandbox.io/s/button-keyup-preventdefault-dn7f0
    if (event.target === event.currentTarget) {
      setActive(false);
    }

    (_otherHandlers$onKeyU = otherHandlers.onKeyUp) == null ? void 0 : _otherHandlers$onKeyU.call(otherHandlers, event); // Keyboard accessibility for non interactive elements

    if (event.target === event.currentTarget && isNonNativeButton() && event.key === ' ' && !event.defaultPrevented) {
      var _otherHandlers$onClic2;

      (_otherHandlers$onClic2 = otherHandlers.onClick) == null ? void 0 : _otherHandlers$onClic2.call(otherHandlers, event);
    }
  });
  const buttonProps = {};

  if (elementType === 'button') {
    buttonProps.type = type != null ? type : 'button';
    buttonProps.disabled = disabled;
  } else {
    if (!href && !to) {
      buttonProps.role = 'button';
    }

    if (disabled) {
      buttonProps['aria-disabled'] = disabled;
    }
  }

  const handleOwnRef = useForkRef(focusVisibleRef, buttonRef);
  const handleRef = useForkRef(ref, handleOwnRef);

  const getRootProps = otherHandlers => {
    const propsEventHandlers = extractEventHandlers(props);

    const externalEventHandlers = _extends({}, propsEventHandlers, otherHandlers);

    const ownEventHandlers = {
      onBlur: handleBlur(externalEventHandlers),
      onFocus: handleFocus(externalEventHandlers),
      onKeyDown: handleKeyDown(externalEventHandlers),
      onKeyUp: handleKeyUp(externalEventHandlers),
      onMouseDown: handleMouseDown(externalEventHandlers),
      onMouseLeave: handleMouseLeave(externalEventHandlers),
      onMouseUp: handleMouseUp(externalEventHandlers)
    };

    const mergedEventHandlers = _extends({}, externalEventHandlers, ownEventHandlers); // onFocusVisible can be present on the props, but since it's not a valid React event handler,
    // it must not be forwarded to the inner component.


    delete mergedEventHandlers.onFocusVisible;
    return _extends({
      tabIndex: disabled ? -1 : tabIndex,
      type,
      ref: handleRef
    }, buttonProps, mergedEventHandlers);
  };

  return {
    getRootProps,
    focusVisible,
    setFocusVisible,
    disabled,
    active
  };
}