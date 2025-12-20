import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, Dimensions, Image, TouchableOpacity, Pressable } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../src/store/atoms';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

type InputMode = 'DOB' | 'AGE';

export default function SignInScreen() {
    const router = useRouter();
    const { settings, setSettings } = useSettingsStore();

    const [name, setName] = useState('');
    const [inputMode, setInputMode] = useState<InputMode>('DOB');

    // DOB State
    const [dob, setDob] = useState<Date | null>(null);
    const [dobText, setDobText] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Age State
    const [age, setAge] = useState('');

    const [isValid, setIsValid] = useState(false);

    // Auto-calculate Age if DOB is selected
    useEffect(() => {
        if (inputMode === 'DOB' && dob) {
            const diff = Date.now() - dob.getTime();
            const ageDate = new Date(diff);
            const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
            if (dobText) {
                // Logic sync
            }
        }
    }, [dob, dobText, inputMode]);

    // Validation Effect
    useEffect(() => {
        const isNameValid = name.trim().length > 0;
        let isDateOrAgeValid = false;

        if (inputMode === 'DOB') {
            isDateOrAgeValid = !!dob;
        } else {
            const ageNum = parseInt(age);
            isDateOrAgeValid = !isNaN(ageNum) && ageNum > 0 && ageNum < 120;
        }

        setIsValid(isNameValid && isDateOrAgeValid);
    }, [name, age, dob, inputMode]);


    const handleNext = () => {
        if (!isValid) return;

        let finalAge = 30;

        if (inputMode === 'DOB' && dob) {
            const diff = Date.now() - dob.getTime();
            const ageDate = new Date(diff);
            finalAge = Math.abs(ageDate.getUTCFullYear() - 1970);
        } else {
            finalAge = parseInt(age) || 30;
        }

        setSettings({
            ...settings,
            name: name,
            currentAge: finalAge,
        });

        router.push('/wizard/step1');
    };

    const handleNameChange = (text: string) => {
        if (/^[a-zA-Z\s]*$/.test(text)) {
            setName(text);
        }
    };

    const handleAgeChange = (text: string) => {
        if (/^\d*$/.test(text)) {
            setAge(text);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const year = selectedDate.getFullYear();
            if (year < 1950) selectedDate.setFullYear(1950);

            setDob(selectedDate);
            const day = selectedDate.getDate().toString().padStart(2, '0');
            const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            setDobText(`${day}/${month}/${year}`);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Image
                        source={require('../../assets/guidefin_logo.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.headline}>Let's set up your profile</Text>
                    <Text style={styles.subtext}>Accurate details help us calculate your perfect retirement plan.</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Name Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            mode="outlined"
                            value={name}
                            onChangeText={handleNameChange}
                            placeholder="Enter your name"
                            placeholderTextColor="#A0AEC0"
                            style={styles.inputOutlined}
                            outlineStyle={styles.inputOutline}
                            activeOutlineColor="#536DFE"
                            selectionColor="#536DFE"
                            left={<TextInput.Icon icon="account" color="#536DFE" />}
                            theme={{ roundness: 12 }}
                        />
                    </View>

                    {/* Segmented Toggle */}
                    <View style={styles.toggleWrapper}>
                        <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                style={[styles.toggleBtn, inputMode === 'DOB' && styles.toggleBtnActive]}
                                onPress={() => setInputMode('DOB')}
                            >
                                <Text style={[styles.toggleText, inputMode === 'DOB' && styles.toggleTextActive]}>Date of Birth</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleBtn, inputMode === 'AGE' && styles.toggleBtnActive]}
                                onPress={() => setInputMode('AGE')}
                            >
                                <Text style={[styles.toggleText, inputMode === 'AGE' && styles.toggleTextActive]}>Current Age</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Dynamic Input Area */}
                    <View style={styles.dynamicInputArea}>
                        {inputMode === 'DOB' ? (
                            <View>
                                <Pressable onPress={() => setShowDatePicker(true)}>
                                    <View pointerEvents="none">
                                        <TextInput
                                            mode="outlined"
                                            value={dobText}
                                            placeholder="DD/MM/YYYY"
                                            placeholderTextColor="#A0AEC0"
                                            editable={false}
                                            style={styles.inputOutlined}
                                            outlineStyle={styles.inputOutline}
                                            activeOutlineColor="#536DFE"
                                            left={<TextInput.Icon icon="calendar" color="#536DFE" />}
                                            theme={{ roundness: 12 }}
                                        />
                                    </View>
                                </Pressable>
                                {showDatePicker && (
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={dob || new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={onDateChange}
                                        minimumDate={new Date(1950, 0, 1)}
                                    />
                                )}
                            </View>
                        ) : (
                            <View>
                                <TextInput
                                    mode="outlined"
                                    value={age}
                                    onChangeText={handleAgeChange}
                                    placeholder="e.g. 30"
                                    placeholderTextColor="#A0AEC0"
                                    keyboardType="numeric"
                                    style={styles.inputOutlined}
                                    outlineStyle={styles.inputOutline}
                                    activeOutlineColor="#536DFE"
                                    selectionColor="#536DFE"
                                    left={<TextInput.Icon icon="cake-variant" color="#536DFE" />}
                                    theme={{ roundness: 12 }}
                                />
                            </View>
                        )}
                    </View>

                </ScrollView>

                {/* Sticky Footer */}
                <View style={styles.footer}>
                    <Button
                        mode="contained"
                        onPress={handleNext}
                        disabled={!isValid}
                        style={[styles.nextButton, !isValid && styles.disabledButton]}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                    >
                        Next
                    </Button>
                    <Text style={styles.poweredBy}>Powered by Finthinkhub</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    logoImage: {
        width: 300,
        height: 120,
        marginTop: 60,
        marginBottom: 40,
    },
    headline: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtext: {
        fontSize: 14,
        color: '#6E6E73',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputOutlined: {
        backgroundColor: '#FFFFFF',
        height: 56,
        fontSize: 16,
    },
    inputOutline: {
        borderRadius: 12,
        borderColor: '#E2E8F0',
    },
    toggleWrapper: {
        alignItems: 'center',
        marginBottom: 24,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F3F6',
        borderRadius: 14,
        padding: 4,
        width: '100%',
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 12,
    },
    toggleBtnActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#718096',
    },
    toggleTextActive: {
        color: '#536DFE', // Unified Primary Blue
        fontWeight: '700',
    },
    dynamicInputArea: {
        marginBottom: 20,
    },
    footer: {
        padding: 24,
        backgroundColor: '#fff',
    },
    nextButton: {
        backgroundColor: '#536DFE',
        borderRadius: 50,
        width: '100%',
        elevation: 4,
        shadowColor: '#536DFE',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    disabledButton: {
        backgroundColor: '#CBD5E0',
        elevation: 0,
        shadowOpacity: 0,
    },
    buttonContent: {
        height: 56,
    },
    buttonLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    poweredBy: {
        textAlign: 'center',
        marginTop: 16,
        fontSize: 12,
        color: '#A0AEC0',
    }
});
