import { animations } from "../animations.config";

export const getAnimationInfoById = (id: number) => {
    return animations.find(animation => animation.id === id);
};