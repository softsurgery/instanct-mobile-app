import { cn } from "@/lib/utils";
import { FormBuilder } from "../shared/form-builder/FormBuilder";
import { StableKeyboardAwareScrollView } from "../shared/StableKeyboardAwareScrollView";
import { useUpdateProfileFormStructure } from "./useUpdateProfileFormStructure";

interface UpdateProfileProps {
  className?: string;
}

export const UpdateProfile = ({ className }: UpdateProfileProps) => {
  const { structure } = useUpdateProfileFormStructure({});
  return (
    <StableKeyboardAwareScrollView
      className={cn("flex flex-col flex-1 p-4", className)}
    >
      <FormBuilder structure={structure} className="mb-10 " />
    </StableKeyboardAwareScrollView>
  );
};
