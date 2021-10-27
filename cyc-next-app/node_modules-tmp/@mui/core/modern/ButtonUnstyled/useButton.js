import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { unstable_useEventCallback as useEventCallback, unstable_useForkRef as useForkRef, unstable_useIsFocusVisible as useIsFocusVisible } from '@mui/utils';
import extractEventHandlers from '../utils/extractEventHandlers';
export default function useButton(props) {
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
    if (focusVisible) {
      event.preventDefault();
    }

    otherHandlers.onMouseLeave?.(event);
  };

  const handleBlur = otherHandlers => event => {
    handleBlurVisible(event);

    if (isFocusVisibleRef.current === false) {
      setFocusVisible(false);
    }

    otherHandlers.onBlur?.(event);
  };

  const handleFocus = useEventCallback(otherHandlers => event => {
    // Fix for https://github.com/facebook/react/issues/7769
    if (!buttonRef.current) {
      buttonRef.current = event.currentTarget;
    }

    handleFocusVisible(event);

    if (isFocusVisibleRef.current === true) {
      setFocusVisible(true);
      otherHandlers.onFocusVisible?.(event);
    }

    otherHandlers.onFocus?.(event);
  });
  const elementType = component ?? components.Root ?? 'button';

  const isNonNativeButton = () => {
    const button = buttonRef.current;
    return elementType !== 'button' && !(button?.tagName === 'A' && button?.href);
  };

  const handleMouseDown = otherHandlers => event => {
    if (event.target === event.currentTarget && !disabled) {
      setActive(true);
    }

    otherHandlers.onMouseDown?.(event);
  };

  const handleMouseUp = otherHandlers => event => {
    if (event.target === event.currentTarget) {
      setActive(false);
    }

    otherHandlers.onMouseUp?.(event);
  };

  const handleKeyDown = useEventCallback(otherHandlers => event => {
    if (event.target === event.currentTarget && isNonNativeButton() && event.key === ' ') {
      event.preventDefault();
    }

    if (event.target === event.currentTarget && event.key === ' ' && !disabled) {
      setActive(true);
    }

    otherHandlers.onKeyDown?.(event); // Keyboard accessibility for non interactive elements

    if (event.target === event.currentTarget && isNonNativeButton() && event.key === 'Enter' && !disabled) {
      event.preventDefault();
      otherHandlers.onClick?.(event);
    }
  });
  const handleKeyUp = useEventCallback(otherHandlers => event => {
    // calling preventDefault in keyUp on a <button> will not dispatch a click event if Space is pressed
    // https://codesandbox.io/s/button-keyup-preventdefault-dn7f0
    if (event.target === event.currentTarget) {
      setActive(false);
    }

    otherHandlers.onKeyUp?.(event); // Keyboard accessibility for non interactive elements

    if (event.target === event.currentTarget && isNonNativeButton() && event.key === ' ' && !event.defaultPrevented) {
      otherHandlers.onClick?.(event);
    }
  });
  const buttonProps = {};

  if (elementType === 'button') {
    buttonProps.type = type ?? 'button';
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