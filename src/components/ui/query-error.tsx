import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueryErrorProps {
  message?: string;
  onRetry?: () => void;
}

/** Inline error state for failed data fetches */
const QueryError = ({ message = "Something went wrong. Please try again.", onRetry }: QueryErrorProps) => (
  <div className="px-6 pt-8 pb-24 max-w-lg mx-auto">
    <div className="bg-destructive/10 border border-destructive/20 rounded-echo-lg p-6 text-center">
      <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
      <p className="text-sm text-destructive font-medium mb-1">Failed to load</p>
      <p className="text-xs text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Try again
        </Button>
      )}
    </div>
  </div>
);

export default QueryError;
