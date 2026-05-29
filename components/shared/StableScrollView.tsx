import React from "react";
import { ScrollView, ScrollViewProps, Text } from "react-native";

interface StableScrollViewProps extends ScrollViewProps {
  className?: string;
  children: React.ReactNode;
}

const wrapChildren = (children: React.ReactNode): React.ReactNode => {
  return React.Children.map(children, (child) => {
    if (child == null) return null;

    // Plain string or number
    if (typeof child === "string" || typeof child === "number") {
      return <Text>{child}</Text>;
    }

    // Fragment: recurse into its children
    if (React.isValidElement(child) && child.type === React.Fragment) {
      const fragment = child as React.ReactElement<any>;
      return <>{wrapChildren(fragment.props.children)}</>;
    }

    // React element with children: recurse
    if (React.isValidElement(child)) {
      const element = child as React.ReactElement<any>;
      if (element.props.children) {
        return React.cloneElement(element, {
          ...element.props,
          children: wrapChildren(element.props.children),
        });
      }
      return element;
    }

    return child;
  });
};

const StableScrollView = React.forwardRef<ScrollView, StableScrollViewProps>(
  (
    { className, children, style, bounces = false, refreshControl, ...props },
    ref,
  ) => {
    return (
      <ScrollView
        ref={ref}
        bounces={refreshControl ? true : bounces}
        alwaysBounceHorizontal={false}
        alwaysBounceVertical={refreshControl ? true : false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        overScrollMode={refreshControl ? "always" : "never"}
        keyboardShouldPersistTaps="handled"
        style={style}
        className={className}
        refreshControl={refreshControl}
        contentContainerStyle={{ flexGrow: 1 }}
        {...props}
      >
        {wrapChildren(children)}
      </ScrollView>
    );
  },
);

StableScrollView.displayName = "StableScrollView";

export default StableScrollView;
