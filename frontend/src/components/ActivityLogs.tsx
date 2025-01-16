import { format } from "date-fns";
import { es } from "date-fns/locale";
import { UserPlus2, RefreshCw, Loader2, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface ActivityLog {
  _id: string;
  message: string;
  user: User;
  type: "created" | "updated" | "deleted";
  createdAt: string;
  updatedAt: string;
}

interface ActivityLogsProps {
  isLoading: boolean;
  logs: ActivityLog[];
}

export default function ActivityLogs({ isLoading, logs }: ActivityLogsProps) {
  const getLogIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "created":
        return <UserPlus2 className="h-6 w-6 text-green-500" />;
      case "updated":
        return <RefreshCw className="h-6 w-6 text-blue-500" />;
      case "deleted":
        return <Trash2 className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="min-h-[500px]">
      <CardHeader>
        <CardTitle>Actividad reciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isLoading ? (
          <>
            {logs.map(log => (
              <div key={log._id} className="flex items-start space-x-4 rounded-lg border p-3">
                <div className="mt-1">{getLogIcon(log.type)}</div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{log.message}</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{getUserInitials(log.user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>{log.user.name}</span>
                      <span>•</span>
                      <time dateTime={log.createdAt}>
                        {format(new Date(log.createdAt), "d 'de' MMMM 'a las' HH:mm", {
                          locale: es,
                        })}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <CardContent>
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </CardContent>
        )}
      </CardContent>
    </Card>
  );
}
