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

export const StableScrollView = ({
  className,
  children,
  style,
  ...props
}: StableScrollViewProps) => {
  return (
    <ScrollView
      bounces={false}
      alwaysBounceHorizontal={false}
      alwaysBounceVertical={false}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      overScrollMode="never"
      style={style}
      className={className}
      {...props}
    >
      {wrapChildren(children)}
    </ScrollView>
  );
};
