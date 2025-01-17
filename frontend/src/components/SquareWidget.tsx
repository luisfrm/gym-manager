import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Link } from "react-router-dom";
type Props = {
  className: string;
  title: string;
  subtitle: string;
  link: string;
  icon: React.ReactNode;
  fontColor: string;
  iconBgColor?: string;
};

const SquareWidget = ({
  className,
  title,
  subtitle,
  link,
  icon,
  fontColor = "text-white",
  iconBgColor = "bg-white",
}: Props) => {
  return (
    <Card className={cn("bg-lime-500 w-full lg:w-1/3 xl:w-1/5", className)}>
      <CardHeader className="bg-whiteflex items-start">
        <div className={cn("bg-slate-900 p-4 rounded-md", iconBgColor)}>{icon}</div>
      </CardHeader>
      <CardContent className={`${fontColor}`}>
        <h3 className="text-4xl font-medium leading-10">{title}</h3>
        <p className="text-sm">{subtitle}</p>
      </CardContent>
      {link && (
        <CardFooter className={`${fontColor}`}>
          <Link to={link} className="text-sm font-bold hover:underline">
            Ver todos
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};

export default SquareWidget;
