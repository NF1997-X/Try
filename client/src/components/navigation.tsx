import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid } from "lucide-react";
import { SlideMenu } from "./slide-menu";

interface NavigationProps {
  editMode?: boolean;
  onEditModeRequest?: () => void;
  onShowCustomization?: () => void;
  onAddRow?: () => void;
  onSaveData?: () => void;
  onGenerateTng?: () => void;
  onAddColumn?: (columnData: { name: string; dataKey: string; type: string; options?: string[] }) => Promise<void>;
  onOptimizeRoute?: () => void;
  onCalculateTolls?: () => void;
  onSaveLayout?: () => void;
  onSavedLinks?: () => void;
  onShowTutorial?: () => void;
  onBulkColorEdit?: () => void;
  isAuthenticated?: boolean;
  theme?: string;
  onToggleTheme?: () => void;
}

export function Navigation({ editMode, onEditModeRequest, onShowCustomization, onAddRow, onSaveData, onGenerateTng, onAddColumn, onOptimizeRoute, onCalculateTolls, onSaveLayout, onSavedLinks, onShowTutorial, onBulkColorEdit, isAuthenticated, theme, onToggleTheme }: NavigationProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return date.toLocaleString('en-US', options);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b-2 border-blue-500/50 dark:border-blue-400/50 bg-gradient-to-r from-blue-500/10 via-blue-600/10 to-blue-700/10 dark:from-blue-500/20 dark:via-blue-600/20 dark:to-blue-700/20 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg shadow-blue-500/20">
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex h-16 items-center justify-between text-[12px]">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-lg shadow-blue-500/30 dark:shadow-blue-500/40 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-105">
                <img 
                  src="/assets/Logofm.png" 
                  alt="Logo" 
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>
              <div className="flex flex-col gap-0.5 leading-tight">
                <span className="font-semibold text-gray-900 dark:text-white leading-none tracking-tight transition-colors" style={{ fontSize: '13px' }}>
                  {editMode ? "Edit Mode" : "Route Management"}
                </span>
                <span className="text-gray-500 dark:text-gray-400 leading-none tracking-wide" style={{ fontSize: '10px' }}>
                  All in one data informations
                </span>
              </div>
            </div>
          </div>

          {/* Navigation - Single Menu Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-blue-200/50 dark:border-blue-500/30 shadow-lg shadow-blue-500/10 dark:shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/30 hover:border-blue-400/60 dark:hover:border-blue-400/50 hover:bg-white dark:hover:bg-black/95 h-10 px-4 rounded-full transition-all duration-300 ease-out group"
            data-testid="button-main-menu"
            title="Menu"
          >
            <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:rotate-90" />
            <span className="hidden md:inline ml-2 text-xs font-medium text-gray-700 dark:text-gray-200">Menu</span>
          </Button>
        </div>
      </div>

      {/* Slide Menu */}
      <SlideMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        editMode={editMode}
        onEditModeRequest={onEditModeRequest}
        onShowCustomization={onShowCustomization}
        onAddRow={onAddRow}
        onSaveData={onSaveData}
        onGenerateTng={onGenerateTng}
        onAddColumn={onAddColumn}
        onOptimizeRoute={onOptimizeRoute}
        onCalculateTolls={onCalculateTolls}
        onSaveLayout={onSaveLayout}
        onSavedLinks={onSavedLinks}
        onShowTutorial={onShowTutorial}
        onBulkColorEdit={onBulkColorEdit}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
    </nav>
  );
}
