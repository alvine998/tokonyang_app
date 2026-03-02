import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';

const AppTextInput: React.FC<TextInputProps> = ({ style, ...props }) => {
    return (
        <TextInput
            {...props}
            style={[styles.defaultInput, style]}
            maxFontSizeMultiplier={1.2} // Cap scaling to 1.2x to prevent layout breakage
        />
    );
};

const styles = StyleSheet.create({
    defaultInput: {
        color: '#000',
    },
});

export default AppTextInput;
