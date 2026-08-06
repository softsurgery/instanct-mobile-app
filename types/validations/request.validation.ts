import { z } from "zod";

// Messages are translation keys, resolved by the consumer in the "explore"
// namespace (see useCreateRequestFormStructure).
export const CreateRequestDtoSchema = (mention: boolean) =>
  z.object({
    receiverIds: z
      .array(z.string())
      .min(1, "request.newRequest.validation.receiversRequired"),

    message: z
      .string({
        error: "request.newRequest.validation.invalidMessage",
      })
      .min(1, "request.newRequest.validation.messageRequired"),

    location: mention
      ? z.string().min(1, "request.newRequest.validation.locationRequired")
      : z.string().optional(),

    latitude: mention
      ? z.number({ error: "request.newRequest.validation.coordinatesRequired" })
      : z.number().optional(),

    longitude: mention
      ? z.number({ error: "request.newRequest.validation.coordinatesRequired" })
      : z.number().optional(),

    time: mention
      ? z.date({
          error: "request.newRequest.validation.timeRequired",
        })
      : z.date().optional(),
  });
