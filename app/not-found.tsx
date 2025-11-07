import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
			<h1 className="text-3xl font-semibold">Page not found</h1>
			<p className="text-muted-foreground">
				The page you are looking for does not exist or has been moved.
			</p>
			<Link href="/" className="text-primary underline underline-offset-4">
				Go back home
			</Link>
		</div>
	);
}


