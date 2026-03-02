import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface AppTextProps extends TextProps {
    children?: React.ReactNode;
}

const AppText: React.FC<AppTextProps> = ({ style, children, ...props }) => {
    return (
        <Text
            {...props}
            style={[styles.defaultText, style]}
            maxFontSizeMultiplier={1.2} // Cap scaling to 1.2x to prevent layout breakage
        >
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    defaultText: {
        color: '#000', // Default color if not specified
    },
});

export default AppText;
