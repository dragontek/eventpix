import { TextInput, PasswordInput, Button, Paper, Title, Container, Text, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { useAuth } from '../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

export default function Login() {
    const { login, listAuthMethods, authWithOAuth2 } = useAuth();
    const navigate = useNavigate();
    const [authProviders, setAuthProviders] = useState<any[]>([]);
    const [passwordEnabled, setPasswordEnabled] = useState(true);

    useEffect(() => {
        listAuthMethods().then((methods) => {
            const providers = (methods as any).authProviders || (methods as any).oauth2?.providers || [];
            const passEnabled = (methods as any).password?.enabled ?? true;
            setAuthProviders(providers);
            setPasswordEnabled(passEnabled);
        }).catch(err => console.error("Failed to load auth methods", err));
    }, [listAuthMethods]);

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
        },
        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        try {
            await login(values.email, values.password);
            notifications.show({ title: 'Welcome back!', message: 'Logged in successfully', color: 'green' });
            navigate('/');
        } catch (error: any) {
            console.error("Login failed:", error);
            notifications.show({
                title: 'Login Error',
                message: error.originalError?.message || error.message || 'Invalid credentials',
                color: 'red'
            });
        }
    };

    const handleOAuth = async (provider: string) => {
        try {
            await authWithOAuth2(provider);
            notifications.show({ title: 'Welcome back!', message: 'Logged in successfully', color: 'green' });
            navigate('/');
        } catch (error: any) {
            console.error("OAuth failed:", error);
            notifications.show({ title: 'Login Error', message: 'Failed to authenticate with provider', color: 'red' });
        }
    };

    return (
        <Container size={420} my={80}>
            <Title ta="center" className="mantine-font-family">
                Welcome to EventPix
            </Title>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
                Admin Console for Hosts
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                {passwordEnabled ? (
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <TextInput label="Email" placeholder="you@example.com" required {...form.getInputProps('email')} />
                        <PasswordInput label="Password" placeholder="Your password" required mt="md" {...form.getInputProps('password')} />

                        <Button fullWidth mt="xl" type="submit">
                            Sign in
                        </Button>
                    </form>
                ) : (
                    authProviders.length === 0 && (
                        <Text c="dimmed" ta="center">No login methods enabled.</Text>
                    )
                )}

                {authProviders.length > 0 && (
                    <>
                        {passwordEnabled && (
                            <Text c="dimmed" size="xs" ta="center" mt="md" mb="xs">
                                Or continue with
                            </Text>
                        )}
                        {!passwordEnabled && (
                            <Text fw={500} size="sm" ta="center" mb="md">
                                Sign in with
                            </Text>
                        )}
                        <Stack gap="xs">
                            {authProviders.map(p => {
                                const isGoogle = p.name === 'google';
                                const isApple = p.name === 'apple';
                                return (
                                    <Button
                                        key={p.name}
                                        fullWidth
                                        variant="default"
                                        onClick={() => handleOAuth(p.name)}
                                        className={isGoogle ? 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50' :
                                            isApple ? 'bg-black text-white hover:bg-gray-900' : ''}
                                        style={
                                            isGoogle ? { color: '#1f1f1f', backgroundColor: 'white', borderColor: '#dfe1e5' } :
                                                isApple ? { color: 'white', backgroundColor: 'black', borderColor: 'transparent' } : {}
                                        }
                                        leftSection={
                                            isGoogle ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                </svg>
                                            ) : isApple ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-1.64 3.57-1.14 3.16.89 5.37 8.35 2.15 13.37zM12.93 2.56C13.68 1.49 15.68.61 16.92 1c.14 1.83-1.66 3.79-3.4 3.91-.95.03-3.23-1.07-2.3-2.35z" /></svg>
                                            ) : null
                                        }
                                    >
                                        Sign in with {p.name.charAt(0).toUpperCase() + p.name.slice(1)}
                                    </Button>
                                );
                            })}
                        </Stack>
                    </>
                )}
            </Paper>

            <Text ta="center" mt="md" size="xs" c="dimmed">
                EventPix Admin
            </Text>
        </Container>
    );
}
