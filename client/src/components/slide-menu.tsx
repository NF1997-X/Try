import { 
  Edit2, 
  Settings, 
  Link2,
  Table2,
  ListChecks,
  Bookmark,
  Sun,
  Moon,
  BookOpen,
  Rows,
  Plus,
  Save,
  Route as RouteIcon,
  Receipt,
  Layout,
  Palette,
  Sparkles,
  DoorOpen
} from "lucide-react";
import { useLocation } from "wouter";

interface SlideMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  theme?: string;
  onToggleTheme?: () => void;
}

export function SlideMenu({
  open,
  onOpenChange,
  editMode,
  onEditModeRequest,
  onShowCustomization,
  onAddRow,
  onSaveData,
  onGenerateTng,
  onAddColumn,
  onOptimizeRoute,
  onCalculateTolls,
  onSaveLayout,
  onSavedLinks,
  onShowTutorial,
  onBulkColorEdit,
  theme,
  onToggleTheme,
}: SlideMenuProps) {
  const [, navigate] = useLocation();

  const handleItemClick = (action: () => void) => {
    action();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in-0 duration-200"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Menu Panel - iPhone Paste Style */}
      <div className="fixed top-[72px] right-3 z-[110] w-[280px] animate-in slide-in-from-right-2 zoom-in-95 duration-200 ease-out">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[16px] shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto py-1">
            {/* Primary Actions */}
            {editMode ? (
              <>
                <button
                  onClick={() => handleItemClick(onSaveData!)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-green-600 dark:text-green-400 font-medium text-[15px] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>
                <div className="h-px bg-gray-200 dark:bg-gray-700 mx-3" />
                <button
                  onClick={() => handleItemClick(onEditModeRequest!)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium text-[15px] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                >
                  <DoorOpen className="w-5 h-5" />
                  <span>Exit Edit Mode</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => handleItemClick(onEditModeRequest!)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium text-[15px] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
              >
                <Edit2 className="w-5 h-5" />
                <span>Enter Edit Mode</span>
              </button>
            )}
            
            <div className="h-px bg-gray-200 dark:bg-gray-700 mx-3" />

            {/* VM Route Actions */}
            {editMode && (
              <>
                <button
                  onClick={() => handleItemClick(() => navigate('/share/tzqe9a'))}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-normal text-[15px] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                >
                  <Link2 className="w-5 h-5" />
                  <span>Share Link</span>
                </button>
                <button
                  onClick={() => handleItemClick(() => navigate('/custom/8m2v27'))}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-normal text-[15px] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                >
                  <Table2 className="w-5 h-5" />
                  <span>Custom Page</span>
                </button>
                <div className="h-px bg-gray-200 dark:bg-gray-700 mx-3" />
              </>
            )}

            <button
              onClick={() => handleItemClick(() => navigate('/custom-tables'))}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-normal text-[15px] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
            >
              <ListChecks className="w-5 h-5" />
              <span>All Custom Tables</span>
            </button>

            <button
              onClick={() => handleItemClick(onSavedLinks!)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-normal text-[15px] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
            >
              <Bookmark className="w-5 h-5" />
              <span>Saved Links</span>
            </button>

            {/* Edit Actions */}
            {editMode && (
              <>
                <div className="h-px bg-gray-200 dark:bg-gray-700 mx-3" />
                
                <button
                  onClick={() => handleItemClick(onAddRow!)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-normal text-[15px] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                >
                  <Rows className="w-5 h-5" />
                  <span>Add Row</span>
                </button>

                {onAddColumn && (
                  <button
                    onClick={() => {
                      const addColumnButton = document.querySelector('[data-testid="button-add-column"]') as HTMLButtonElement;
                      if (addColumnButton) addColumnButton.click();
                      onOpenChange(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-normal text-[15px] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Column</span>
                  </button>
                )}

                <button
                  onClick={() => handleItemClick(onShowCustomization!)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-normal text-[15px] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                >
                  <Layout className="w-5 h-5" />
                  <span>Customize Columns</span>
                </button>

                <button
                  onClick={() => handleItemClick(onBulkColorEdit!)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-normal text-[15px] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                >
                  <Palette className="w-5 h-5" />
                  <span>Bulk Color Edit</span>
                </button>

                {onOptimizeRoute && (
                  <button
                    onClick={() => handleItemClick(onOptimizeRoute)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-normal text-[15px] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                  >
                    <RouteIcon className="w-5 h-5" />
                    <span>Optimize Route</span>
                  </button>
                )}

                {onCalculateTolls && (
                  <button
                    onClick={() => handleItemClick(onCalculateTolls)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-normal text-[15px] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                  >
                    <Receipt className="w-5 h-5" />
                    <span>Calculate Tolls</span>
                  </button>
                )}

                {onGenerateTng && (
                  <button
                    onClick={() => handleItemClick(onGenerateTng)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-normal text-[15px] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Generate TNG</span>
                  </button>
                )}

                {onSaveLayout && (
                  <button
                    onClick={() => handleItemClick(onSaveLayout)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-normal text-[15px] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                  >
                    <Layout className="w-5 h-5" />
                    <span>Save Layout</span>
                  </button>
                )}

                {onShowTutorial && (
                  <button
                    onClick={() => handleItemClick(onShowTutorial)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-normal text-[15px] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>Show Tutorial</span>
                  </button>
                )}
              </>
            )}

            {/* Settings */}
            <div className="h-px bg-gray-200 dark:bg-gray-700 mx-3" />

            <button
              onClick={() => handleItemClick(onToggleTheme!)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-normal text-[15px] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-5 h-5" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleItemClick(() => navigate('/help'))}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-normal text-[15px] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>User Guide</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
