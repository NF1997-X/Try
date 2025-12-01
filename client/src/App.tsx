import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TablePage from "@/pages/table";
import SharedTablePage from "@/pages/shared-table";
import CustomTableList from "@/pages/custom-table-list";
import CustomTableView from "@/pages/custom-table";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

function Router() {
  const { toast } = useToast();
  const [pullStartY, setPullStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);

  // Check for service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                toast({
                  title: "Update Available",
                  description: "A new version is available. Refresh to update.",
                  action: (
                    <button
                      onClick={() => window.location.reload()}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Refresh
                    </button>
                  ),
                  duration: 10000,
                });
              }
            });
          }
        });

        // Check for updates every 30 minutes
        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);
      });
    }
  }, [toast]);

  // Pull-to-refresh gesture
  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      setPullStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (pullStartY > 0 && window.scrollY === 0) {
      const distance = e.touches[0].clientY - pullStartY;
      if (distance > 0) {
        setPullDistance(Math.min(distance, 150));
        // Prevent default scroll when pulling
        if (distance > 10) {
          e.preventDefault();
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 100 && !isRefreshing) {
      setShowRefreshDialog(true);
    }
    setPullDistance(0);
    setPullStartY(0);
  };

  const handleConfirmRefresh = () => {
    setIsRefreshing(true);
    setShowRefreshDialog(false);
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart as any, { passive: true });
    document.addEventListener('touchmove', handleTouchMove as any, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart as any);
      document.removeEventListener('touchmove', handleTouchMove as any);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullStartY, pullDistance, isRefreshing]);

  return (
    <div className="min-h-screen pb-16 text-sm">
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed left-0 right-0 z-[60] flex justify-center items-center pointer-events-none transition-opacity"
          style={{
            top: '80px',
            opacity: Math.min(pullDistance / 100, 1),
            transform: `translateY(${Math.max(pullDistance - 80, 0)}px)`,
          }}
        >
          <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <RefreshCw 
              className={`w-4 h-4 ${isRefreshing || pullDistance > 100 ? 'animate-spin' : ''}`}
              style={{
                transform: `rotate(${pullDistance * 2.5}deg)`,
              }}
            />
            <span className="text-sm font-medium">
              {isRefreshing ? 'Refreshing...' : pullDistance > 100 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      {/* Refresh Confirmation Dialog */}
      <Dialog open={showRefreshDialog} onOpenChange={setShowRefreshDialog}>
        <DialogContent className="max-w-sm animate-in zoom-in-95 duration-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              Refresh Page?
            </DialogTitle>
            <DialogDescription>
              Do you want to refresh the page? Any unsaved changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowRefreshDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmRefresh}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Switch>
        <Route path="/">
          {() => <TablePage />}
        </Route>
        <Route path="/share/:shareId">
          {() => <SharedTablePage />}
        </Route>
        <Route path="/custom-tables">
          {() => <CustomTableList />}
        </Route>
        <Route path="/custom/:shareId">
          {() => <CustomTableView />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
