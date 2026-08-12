import { useLocalSearchParams } from "expo-router";
import { NewSignInPortal } from "@/components/utilities/NewSignInPortal";

/**
 * Renders the "New sign-in" security notification screen.
 *
 * Every value can be overridden through deep link query params, e.g.
 * `instinct://main/test/deep-link-test?device=Pixel%209&location=Berlin,%20Germany`.
 */
export default function Screen() {
  const params = useLocalSearchParams<{
    device?: string;
    os?: string;
    location?: string;
    ip?: string;
    time?: string;
    when?: string;
  }>();

  return <NewSignInPortal {...params} />;
}
