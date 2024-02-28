import { getServerSideUser } from "@/lib/payload-utils";
import Image from "next/image";
import { cookies } from "next/headers";
import { getPayloadClient } from "../../get-payload";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const ThankYouPage = async ({ searchParams }: PageProps) => {
  const orderId = searchParams.orderId;
  const nextCookies = cookies();

  const { user } = await getServerSideUser(nextCookies);
  const payload = await getPayloadClient();

  const { docs: orders } = await payload.find({
    collection: "orders",
    depth: 2,
    where: {
      id: {
        equals: orderId,
      },
    },
  });

  const [order] = orders;

  if (!order) return notFound();

  const orderUserId =
    typeof order.user === "string" ? order.user : order.user.id;

  if (orderUserId !== user?.id) {
    return redirect(`/sign-in?origin=thank-you?orderId=${order.id}`);
  }

  return (
    <main className="relative ">
      <div className="hidden md:block h-80 overflow-hidden lg:absolute lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12">
        <Image
          fill
          src="/thankyou.png"
          className="h-full w-full object-cover object-center"
          alt="Thank you Image"
        />
      </div>

      <div>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24">
          <div className="lg:col-start-2">
            <p className="text-sm font-medium text-blue-600">
              Order successful
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Thanks for ordering
            </h1>
            {order._isPaid ? (
              <p className="mt-2 text-base text-muted-foreground">
                Your order was processed and you're able to download it now.
                We&apos;ve sent your receipt and order details to{" "}
                {typeof order.user !== "string" ? (
                  <span className="font-medium text-gray-900">
                    {order.user.email}
                  </span>
                ) : null}
                .
              </p>
            ) : (
              <p></p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ThankYouPage;
