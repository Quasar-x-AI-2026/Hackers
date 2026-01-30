import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminDashboard() {
    return (
        <div className="mt-25">
            <Container className="flex mx-auto justify-center">
                <div className="flex flex-row gap-5">
                    <Link href={'/register'}>
                        <Button variant={"pill"}>
                            Add New Doctor
                        </Button>
                    </Link>
                    <Link href={'/register'}>
                        <Button variant={"pill"}>
                            Method 2
                        </Button>
                    </Link>
                    <Link href={'/register'}>
                        <Button variant={"pill"}>
                            Method 3
                        </Button>
                    </Link>
                </div>
            </Container>
        </div>
    )
}