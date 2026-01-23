import {
  DynamicScene,
  DynamicSceneRowVariant,
  DynamicSceneSection,
} from "../shared/scene-builder/types";
import { useMemo } from "react";
import { View } from "react-native";
import { Text } from "../ui/text";
import { router } from "expo-router";
import { UserStore } from "@/stores/useUserStore";
import { ResponseExperienceDto } from "@/types";
import { format } from "date-fns";
import { SceneBuilder } from "../shared/scene-builder/SceneBuilder";
import { useSceneBuilderStore } from "../shared/scene-builder/useSceneBuilderStore";

interface useEditProfileRecipesProps {
  store: UserStore | null;
}

export const useEditProfileRecipes = ({
  store,
}: useEditProfileRecipesProps) => {
  const sceneBuilderStore = useSceneBuilderStore();

  const experienceRecipe = useMemo(() => {
    const experienceSections: Record<string, DynamicSceneSection> = {};

    store?.experiences?.forEach((exp, index) => {
      const key = `experience_${exp.title}`;

      experienceSections[key] = {
        title: `Experience ${index + 1}`,
        rows: [
          {
            label: "",
            variant: DynamicSceneRowVariant.CUSTOM,
            props: {
              render: () => (
                <View className="flex flex-col">
                  {/* Job Title */}
                  <Text className="text-lg font-bold">{exp.title}</Text>
                  {/* Company */}

                  <Text className="text-sm text-muted-foreground">
                    {exp.company}
                  </Text>
                  {/* Start Date */}
                  <Text className="text-sm">
                    {format(new Date(exp.startDate), "MMM yyyy")} -{" "}
                    {exp.endDate
                      ? format(new Date(exp.endDate), "MMM yyyy")
                      : "Present"}
                  </Text>
                  {/* Description */}
                  <View className="flex-col items-start gap-2 mt-2">
                    <Text className="text-sm">{exp.description}</Text>
                  </View>
                </View>
              ),
            },
          },
          {
            label: "Edit Experience",
            className: "",
            labelClassName: "font-bold",
            variant: DynamicSceneRowVariant.TAPPABLE,
            props: {
              onPress: () => {
                sceneBuilderStore.push?.(
                  `exp-${index}`,
                  singleExperienceRecipe(index, exp),
                );
                router.push({
                  pathname: "/main/scene-screen",
                  params: { id: `exp-${index}` },
                });
              },
            },
          },
          {
            label: "Delete Experience",
            labelClassName: "text-red-700 font-bold",
            variant: DynamicSceneRowVariant.TAPPABLE,
          },
        ],
      };
    });

    const singleExperienceRecipe = (
      index: number,
      exp: ResponseExperienceDto,
    ): DynamicScene => {
      return {
        title: "Edit Experience",
        component: SceneBuilder,
        props: {
          title: `Edit ${exp.title}`,
          scenes: {
            "0": {
              title: `Experience ${index + 1}`,
              rows: [
                {
                  label: "Job Title",
                  variant: DynamicSceneRowVariant.TEXT,
                  props: {
                    value: exp.title,
                    onChangeText: (text: string) => {
                      store?.setNested(
                        `updateDto.profile.experiences.${index}.title`,
                        text,
                      );
                    },
                  },
                },
                {
                  label: "Start Date",
                  variant: DynamicSceneRowVariant.DATE,
                  props: {
                    date: exp.startDate,
                    onChangeDate: (date: Date) => {
                      store?.setNested(
                        `updateDto.profile.experiences.${index}.startDate`,
                        date,
                      );
                    },
                  },
                },
                {
                  label: "End Date",
                  variant: DynamicSceneRowVariant.DATE,
                  props: {
                    date: exp.endDate,
                    onChangeDate: (date: Date) => {
                      store?.setNested(
                        `updateDto.profile.experiences.${index}.endDate`,
                        date,
                      );
                    },
                  },
                },
                {
                  label: "Description",
                  variant: DynamicSceneRowVariant.TEXTAREA,
                  props: {
                    text: exp.description,
                  },
                },
              ],
            } satisfies DynamicSceneSection,
          },
        },
      };
    };

    return {
      title: "Edit Experiences",
      component: SceneBuilder,
      props: {
        title: "Edit Experiences",
        scenes: experienceSections,
      },
    } satisfies DynamicScene;
  }, [store?.experiences?.length]);

  return { experienceRecipe };
};
