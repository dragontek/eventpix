import EventPageClient from "./EventPageClient";


export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <EventPageClient id={id} />;
}
