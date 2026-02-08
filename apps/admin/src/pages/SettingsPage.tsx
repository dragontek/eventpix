import { Container, Title, Card, Text, Group, Switch, Stack, Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function SettingsPage() {
    const [opened, { open, close }] = useDisclosure(false);

    const handleDeleteAccount = () => {
        close();
        console.log("Account deleted");
        // In real app: call API, then logout
    };

    return (
        <Container size="lg">
            <Modal opened={opened} onClose={close} title="Delete Account" centered>
                <Text size="sm" mb="lg">
                    Are you sure you want to delete your account? This action is permanent and cannot be undone. All your events and photos will be lost.
                </Text>
                <Group justify="flex-end">
                    <Button variant="default" onClick={close}>Cancel</Button>
                    <Button color="red" onClick={handleDeleteAccount}>Delete Account</Button>
                </Group>
            </Modal>

            <Title order={2} mb="xl">Settings</Title>

            <Stack gap="lg">
                {/* General Settings */}
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={4} mb="md">General</Title>
                    <Stack gap="md">
                        <Group justify="space-between">
                            <div>
                                <Text fw={500}>Email Notifications</Text>
                                <Text size="xs" c="dimmed">Receive updates about your events</Text>
                            </div>
                            <Switch defaultChecked />
                        </Group>
                        <Group justify="space-between">
                            <div>
                                <Text fw={500}>Public Profile</Text>
                                <Text size="xs" c="dimmed">Allow others to find you by email</Text>
                            </div>
                            <Switch />
                        </Group>
                    </Stack>
                </Card>

                {/* About */}
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={4} mb="md">About</Title>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm">Version</Text>
                        <Text size="sm" fw={700} font-family="monospace">1.0.0 (Beta)</Text>
                    </Group>
                    <Group justify="space-between">
                        <Text size="sm">Support</Text>
                        <Text size="sm" c="blue" td="underline" style={{ cursor: 'pointer' }}>Contact Us</Text>
                    </Group>
                </Card>

                {/* Danger Zone */}
                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ borderColor: 'var(--mantine-color-red-3)', backgroundColor: 'var(--mantine-color-red-0)' }}>
                    <Title order={4} c="red" mb="md">Danger Zone</Title>
                    <Text size="sm" mb="md">
                        Permanently delete your account and all associated data.
                    </Text>
                    <Button color="red" variant="outline" onClick={open}>
                        Delete Account
                    </Button>
                </Card>
            </Stack>
        </Container>
    );
}
