import React from 'react';
import { Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface KeyboardSafeLayoutProps {
    children: React.ReactNode;
}

export default function KeyboardSafeLayout({ children }: KeyboardSafeLayoutProps) {
    return (
        <KeyboardAwareScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            enableOnAndroid={true}
            keyboardOpeningTime={0}
            extraScrollHeight={Platform.OS === 'android' ? 20 : 80}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            {children}
        </KeyboardAwareScrollView>
    );
}
