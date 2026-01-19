import {
  DynamicScene,
  DynamicSceneRowVariant,
  DynamicSceneSection,
} from "../shared/scene-builder/types";
import { useMemo } from "react";
import { View } from "react-native";
import { Text } from "../ui/text";
import { router } from "expo-router";
import { Experience } from "~/types";
import { UserStore } from "@/stores/useUserStore";
import { useSceneBuilderStore } from "../shared/scene-builder/useSceneBuilderStore";

interface useEditProfileRecipesProps {
  store: UserStore | null;
}

export const useEditProfileRecipes = ({
  store,
}: useEditProfileRecipesProps) => {
  const { push } = useSceneBuilderStore();
  const experiences = store?.response?.experiences;

  const experienceRecipe = useMemo(() => {
    if (!experiences) {
      return {
        name: "Edit Experiences",
        content: {},
      };
    }

    const experienceSections: Record<string, DynamicSceneSection> = {};

    experiences.forEach((exp, index) => {
      const key = `experience_${exp.title}`;

      experienceSections[key] = {
        name: `Experience ${index + 1}`,
        rows: [
          {
            label: "",
            variant: DynamicSceneRowVariant.CUSTOM,
            props: {
              render: () => (
                <View className="flex flex-col">
                  {/* Job Title */}
                  <Text>
                    <Text className="text-sm text-muted-foreground">
                      Job Title:
                    </Text>{" "}
                    <Text className="text-sm">{exp.title}</Text>
                  </Text>

                  {/* Company */}
                  <Text>
                    <Text className="text-sm text-muted-foreground">
                      Company:
                    </Text>{" "}
                    <Text className="text-sm">{exp.company}</Text>
                  </Text>

                  {/* Start Date */}
                  <Text>
                    <Text className="text-sm text-muted-foreground">
                      Start Date:
                    </Text>{" "}
                    <Text className="text-sm">{exp.startDate}</Text>
                  </Text>

                  {/* End Date */}
                  <Text>
                    <Text className="text-sm text-muted-foreground">
                      End Date:
                    </Text>{" "}
                    <Text className="text-sm">{exp.endDate}</Text>
                  </Text>

                  {/* Description */}
                  <View className="flex-col items-start gap-2">
                    <Text>
                      <Text className="text-sm text-muted-foreground">
                        Description:
                      </Text>{" "}
                      <Text className="text-sm">{exp.description}</Text>
                    </Text>
                  </View>
                </View>
              ),
            },
          },
          {
            label: "Edit Experience",
            labelClassName: "text-blue-500 font-bold",
            variant: DynamicSceneRowVariant.TAPPABLE,
            props: {
              onPress: () => {
                push?.(`exp-${index}`, singleExperienceRecipe(index, exp));
                router.push({
                  pathname: "/main/scene-screen",
                  params: { id: `exp-${index}` },
                });
              },
            },
          },
          {
            label: "Delete Experience",
            labelClassName: "text-red-500 font-bold",
            variant: DynamicSceneRowVariant.TAPPABLE,
          },
        ],
      };
    });

    const singleExperienceRecipe = (
      index: number,
      exp: Experience,
    ): DynamicScene => {
      return {
        name: "Edit Experience",
        content: {
          "0": {
            name: `Experience ${index + 1}`,
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
          },
        },
      };
    };

    return {
      name: "Edit Experiences",
      content: experienceSections,
    };
  }, [experiences?.length]);

  return { experienceRecipe };
};
