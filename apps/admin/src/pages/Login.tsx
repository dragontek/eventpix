import { TextInput, PasswordInput, Button, Paper, Title, Container, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
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

    return (
        <Container size={420} my={80}>
            <Title ta="center" className="mantine-font-family">
                Welcome to EventPix
            </Title>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
                Admin Console for Hosts
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput label="Email" placeholder="you@example.com" required {...form.getInputProps('email')} />
                    <PasswordInput label="Password" placeholder="Your password" required mt="md" {...form.getInputProps('password')} />

                    <Button fullWidth mt="xl" type="submit">
                        Sign in
                    </Button>
                </form>
            </Paper>

            <Text ta="center" mt="md" size="xs" c="dimmed">
                Demo: host@eventpix.io / password123
            </Text>
        </Container>
    );
}
