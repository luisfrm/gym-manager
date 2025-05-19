import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Link } from "react-router-dom";
import { ReactNode } from "react";

interface SquareWidgetProps {
  title: ReactNode;
  subtitle: string;
  link: string;
  icon: ReactNode;
  className?: string;
  fontColor?: string;
  iconBgColor?: string;
}

const SquareWidget = ({
  title,
  subtitle,
  link,
  icon,
  className = "",
  fontColor = "text-dark",
  iconBgColor = "bg-slate-300",
}: SquareWidgetProps) => {
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
