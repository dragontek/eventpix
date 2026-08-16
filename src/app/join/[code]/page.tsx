import JoinPageClient from "./JoinPageClient";


export default async function Page({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    return <JoinPageClient code={code} />;
}
