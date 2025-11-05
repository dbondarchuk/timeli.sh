import {
  DynamicIcon as LucideIcon,
  IconName as LucideIconName,
  iconNames as lucideIconNames,
} from "lucide-react/dynamic";

export type IconName = LucideIconName;
export const iconNames = lucideIconNames;

export type IconProps = React.ComponentProps<typeof LucideIcon>;

export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  return <LucideIcon name={name} {...props} />;
};
