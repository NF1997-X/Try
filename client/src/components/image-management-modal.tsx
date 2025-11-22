import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Upload, Link as LinkIcon, Pencil, Trash2, X, AlertTriangle } from "lucide-react";
import { UseMutationResult } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ImageData {
  url: string;
  caption?: string;
}

interface ImageManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowId: string;
  location?: string;
  images: ImageData[];
  onAddImage: UseMutationResult<any, Error, { rowId: string; imageUrl: string; caption?: string }, unknown>;
  onUpdateImage: UseMutationResult<any, Error, { rowId: string; oldImageUrl: string; newImageUrl: string; caption?: string }, unknown>;
  onDeleteImage: UseMutationResult<any, Error, { rowId: string; imageUrl: string }, unknown>;
}

type ModalMode = 'add' | 'edit' | 'delete';
type AddMethod = 'url' | 'upload';
type EditAction = 'replace' | 'caption' | 'url';
type DeleteAction = 'caption' | 'image' | 'all';

export function ImageManagementModal({
  open,
  onOpenChange,
  rowId,
  location,
  images,
  onAddImage,
  onUpdateImage,
  onDeleteImage,
}: ImageManagementModalProps) {
  const hasImages = images && images.length > 0;
  const [mode, setMode] = useState<ModalMode>('add');
  
  // Add Image States
  const [addMethod, setAddMethod] = useState<AddMethod>('url');
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageCaption, setNewImageCaption] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  
  // Edit States
  const [editAction, setEditAction] = useState<EditAction>('replace');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editUrlValue, setEditUrlValue] = useState("");
  
  // Delete States
  const [deleteAction, setDeleteAction] = useState<DeleteAction>('caption');
  const [deleteImageIndex, setDeleteImageIndex] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDeleteAction, setPendingDeleteAction] = useState<{ action: DeleteAction; index?: number } | null>(null);
  
  const { toast } = useToast();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setMode(hasImages ? 'edit' : 'add');
      setAddMethod('url');
      setNewImageUrl("");
      setNewImageCaption("");
      setUploadFile(null);
      setEditAction('replace');
      setSelectedImageIndex(0);
      setEditImageUrl("");
      setEditCaption(images[0]?.caption || "");
      setEditUrlValue(images[0]?.url || "");
      setDeleteAction('caption');
      setDeleteImageIndex(0);
    }
  }, [open, hasImages, images]);

  // Update edit fields when selected image changes
  useEffect(() => {
    if (images[selectedImageIndex]) {
      setEditCaption(images[selectedImageIndex].caption || "");
      setEditUrlValue(images[selectedImageIndex].url || "");
    }
  }, [selectedImageIndex, images]);

  // Handle Add Image
  const handleAddImage = async () => {
    try {
      let imageUrl = newImageUrl;

      // If upload method, handle file upload
      if (addMethod === 'upload' && uploadFile) {
        // Create FormData and upload
        const formData = new FormData();
        formData.append('file', uploadFile);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) throw new Error('Upload failed');
        
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      if (!imageUrl) {
        toast({
          title: "Error",
          description: "Please provide an image URL or upload a file.",
          variant: "destructive",
        });
        return;
      }

      await onAddImage.mutateAsync({
        rowId,
        imageUrl,
        caption: newImageCaption || undefined,
      });

      toast({
        title: "Image Added",
        description: "Image has been added successfully.",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add image.",
        variant: "destructive",
      });
    }
  };

  // Handle Edit Image
  const handleEditImage = async () => {
    try {
      const currentImage = images[selectedImageIndex];
      if (!currentImage) return;

      if (editAction === 'replace') {
        // Replace entire image
        if (!editImageUrl) {
          toast({
            title: "Error",
            description: "Please provide a new image URL.",
            variant: "destructive",
          });
          return;
        }

        await onUpdateImage.mutateAsync({
          rowId,
          oldImageUrl: currentImage.url,
          newImageUrl: editImageUrl,
          caption: currentImage.caption,
        });

        toast({
          title: "Image Replaced",
          description: "Image has been replaced successfully.",
        });
      } else if (editAction === 'caption') {
        // Update caption only
        await onUpdateImage.mutateAsync({
          rowId,
          oldImageUrl: currentImage.url,
          newImageUrl: currentImage.url,
          caption: editCaption || undefined,
        });

        toast({
          title: "Caption Updated",
          description: "Image caption has been updated.",
        });
      } else if (editAction === 'url') {
        // Update URL only
        if (!editUrlValue) {
          toast({
            title: "Error",
            description: "Please provide a valid URL.",
            variant: "destructive",
          });
          return;
        }

        await onUpdateImage.mutateAsync({
          rowId,
          oldImageUrl: currentImage.url,
          newImageUrl: editUrlValue,
          caption: currentImage.caption,
        });

        toast({
          title: "URL Updated",
          description: "Image URL has been updated.",
        });
      }

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update image.",
        variant: "destructive",
      });
    }
  };

  // Handle Delete (with confirmation)
  const handleDeleteRequest = (action: DeleteAction, index?: number) => {
    setPendingDeleteAction({ action, index: index ?? deleteImageIndex });
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteAction) return;

    try {
      const { action, index } = pendingDeleteAction;

      if (action === 'caption') {
        // Delete caption only (set to empty)
        const currentImage = images[index!];
        await onUpdateImage.mutateAsync({
          rowId,
          oldImageUrl: currentImage.url,
          newImageUrl: currentImage.url,
          caption: undefined,
        });

        toast({
          title: "Caption Deleted",
          description: "Image caption has been removed.",
        });
      } else if (action === 'image') {
        // Delete single image
        const imageToDelete = images[index!];
        await onDeleteImage.mutateAsync({
          rowId,
          imageUrl: imageToDelete.url,
        });

        toast({
          title: "Image Deleted",
          description: "Image has been deleted successfully.",
        });
      } else if (action === 'all') {
        // Delete all images
        for (const image of images) {
          await onDeleteImage.mutateAsync({
            rowId,
            imageUrl: image.url,
          });
        }

        toast({
          title: "All Images Deleted",
          description: `${images.length} image(s) have been deleted.`,
        });
      }

      setShowDeleteDialog(false);
      setPendingDeleteAction(null);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] bg-white/90 dark:bg-black/90 backdrop-blur-3xl border-2 border-blue-200/60 dark:border-blue-700/60 shadow-[0_20px_80px_0_rgba(59,130,246,0.4)] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {hasImages ? 'Manage Images' : 'Add Image'} - {location || 'Location'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Mode Tabs - Only show if has images */}
            {hasImages && (
              <Tabs value={mode} onValueChange={(v) => setMode(v as ModalMode)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-blue-100/50 dark:bg-blue-900/30">
                  <TabsTrigger value="add" className="text-xs">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Add
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="text-xs">
                    <Pencil className="w-3 h-3 mr-1" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="delete" className="text-xs">
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </TabsTrigger>
                </TabsList>

                {/* Add Image Tab */}
                <TabsContent value="add" className="space-y-4 mt-4">
                  <Tabs value={addMethod} onValueChange={(v) => setAddMethod(v as AddMethod)}>
                    <TabsList className="grid w-full grid-cols-2 bg-green-100/50 dark:bg-green-900/30">
                      <TabsTrigger value="url" className="text-xs">
                        <LinkIcon className="w-3 h-3 mr-1" />
                        By URL
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="text-xs">
                        <Upload className="w-3 h-3 mr-1" />
                        Upload
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="url" className="space-y-3 mt-4">
                      <div>
                        <Label className="text-sm font-semibold">Image URL</Label>
                        <Input
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">Caption (Optional)</Label>
                        <Textarea
                          value={newImageCaption}
                          onChange={(e) => setNewImageCaption(e.target.value)}
                          placeholder="Add a caption..."
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-3 mt-4">
                      <div>
                        <Label className="text-sm font-semibold">Select File</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          className="mt-1"
                        />
                        {uploadFile && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Selected: {uploadFile.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">Caption (Optional)</Label>
                        <Textarea
                          value={newImageCaption}
                          onChange={(e) => setNewImageCaption(e.target.value)}
                          placeholder="Add a caption..."
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                {/* Edit Image Tab */}
                <TabsContent value="edit" className="space-y-4 mt-4">
                  {/* Image Selector */}
                  <div>
                    <Label className="text-sm font-semibold">Select Image to Edit</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {images.map((img, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageIndex === index
                              ? 'border-blue-500 ring-2 ring-blue-300'
                              : 'border-gray-300 hover:border-blue-300'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.caption || `Image ${index + 1}`}
                            className="w-full h-20 object-cover"
                          />
                          {selectedImageIndex === index && (
                            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                ✓
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Edit Actions */}
                  <Tabs value={editAction} onValueChange={(v) => setEditAction(v as EditAction)}>
                    <TabsList className="grid w-full grid-cols-3 bg-yellow-100/50 dark:bg-yellow-900/30">
                      <TabsTrigger value="replace" className="text-xs">Replace</TabsTrigger>
                      <TabsTrigger value="caption" className="text-xs">Caption</TabsTrigger>
                      <TabsTrigger value="url" className="text-xs">URL</TabsTrigger>
                    </TabsList>

                    <TabsContent value="replace" className="space-y-3 mt-4">
                      <div>
                        <Label className="text-sm font-semibold">New Image URL</Label>
                        <Input
                          value={editImageUrl}
                          onChange={(e) => setEditImageUrl(e.target.value)}
                          placeholder="https://example.com/new-image.jpg"
                          className="mt-1"
                        />
                      </div>
                      <div className="px-3 py-2 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          ⚠️ This will replace the current image with a new one. Caption will be preserved.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="caption" className="space-y-3 mt-4">
                      <div>
                        <Label className="text-sm font-semibold">Edit Caption</Label>
                        <Textarea
                          value={editCaption}
                          onChange={(e) => setEditCaption(e.target.value)}
                          placeholder="Enter new caption..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          💡 Leave empty to remove caption
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="url" className="space-y-3 mt-4">
                      <div>
                        <Label className="text-sm font-semibold">Edit Image URL</Label>
                        <Input
                          value={editUrlValue}
                          onChange={(e) => setEditUrlValue(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="mt-1"
                        />
                      </div>
                      <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          📝 Update the URL of the current image
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                {/* Delete Tab */}
                <TabsContent value="delete" className="space-y-4 mt-4">
                  <Tabs value={deleteAction} onValueChange={(v) => setDeleteAction(v as DeleteAction)}>
                    <TabsList className="grid w-full grid-cols-3 bg-red-100/50 dark:bg-red-900/30">
                      <TabsTrigger value="caption" className="text-xs">Caption</TabsTrigger>
                      <TabsTrigger value="image" className="text-xs">Single</TabsTrigger>
                      <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    </TabsList>

                    <TabsContent value="caption" className="space-y-3 mt-4">
                      <div>
                        <Label className="text-sm font-semibold">Select Image</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {images.map((img, index) => (
                            <div
                              key={index}
                              onClick={() => setDeleteImageIndex(index)}
                              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                deleteImageIndex === index
                                  ? 'border-red-500 ring-2 ring-red-300'
                                  : 'border-gray-300 hover:border-red-300'
                              }`}
                            >
                              <img
                                src={img.url}
                                alt={img.caption || `Image ${index + 1}`}
                                className="w-full h-20 object-cover"
                              />
                              {img.caption && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[8px] px-1 py-0.5 truncate">
                                  {img.caption}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="px-3 py-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          🗑️ This will remove the caption only. Image will remain.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="image" className="space-y-3 mt-4">
                      <div>
                        <Label className="text-sm font-semibold">Select Image to Delete</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {images.map((img, index) => (
                            <div
                              key={index}
                              onClick={() => setDeleteImageIndex(index)}
                              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                deleteImageIndex === index
                                  ? 'border-red-500 ring-2 ring-red-300'
                                  : 'border-gray-300 hover:border-red-300'
                              }`}
                            >
                              <img
                                src={img.url}
                                alt={img.caption || `Image ${index + 1}`}
                                className="w-full h-20 object-cover"
                              />
                              {deleteImageIndex === index && (
                                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                  <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="px-3 py-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          ⚠️ This will permanently delete the selected image
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="all" className="space-y-3 mt-4">
                      <div className="px-4 py-3 bg-red-100 dark:bg-red-950/50 border-2 border-red-300 dark:border-red-700 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                              Delete All Images
                            </p>
                            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                              This will permanently delete all {images.length} image(s) from this location. This action cannot be undone.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {images.map((img, index) => (
                          <div key={index} className="relative rounded-lg overflow-hidden border border-red-300">
                            <img
                              src={img.url}
                              alt={img.caption || `Image ${index + 1}`}
                              className="w-full h-16 object-cover opacity-50"
                            />
                            <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                              <X className="w-4 h-4 text-red-700" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
            )}

            {/* No Images State - Show Add Form */}
            {!hasImages && (
              <div className="space-y-4">
                <Tabs value={addMethod} onValueChange={(v) => setAddMethod(v as AddMethod)}>
                  <TabsList className="grid w-full grid-cols-2 bg-green-100/50 dark:bg-green-900/30">
                    <TabsTrigger value="url" className="text-xs">
                      <LinkIcon className="w-3 h-3 mr-1" />
                      By URL
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="text-xs">
                      <Upload className="w-3 h-3 mr-1" />
                      Upload
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="url" className="space-y-3 mt-4">
                    <div>
                      <Label className="text-sm font-semibold">Image URL</Label>
                      <Input
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Caption (Optional)</Label>
                      <Textarea
                        value={newImageCaption}
                        onChange={(e) => setNewImageCaption(e.target.value)}
                        placeholder="Add a caption..."
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-3 mt-4">
                    <div>
                      <Label className="text-sm font-semibold">Select File</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="mt-1"
                      />
                      {uploadFile && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Selected: {uploadFile.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Caption (Optional)</Label>
                      <Textarea
                        value={newImageCaption}
                        onChange={(e) => setNewImageCaption(e.target.value)}
                        placeholder="Add a caption..."
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={onAddImage.isPending || onUpdateImage.isPending || onDeleteImage.isPending}
              className="bg-white/60 dark:bg-black/60 backdrop-blur-xl"
            >
              Cancel
            </Button>

            {mode === 'add' && (
              <Button
                onClick={handleAddImage}
                disabled={onAddImage.isPending}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {onAddImage.isPending ? 'Adding...' : 'Add Image'}
              </Button>
            )}

            {mode === 'edit' && (
              <Button
                onClick={handleEditImage}
                disabled={onUpdateImage.isPending}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
              >
                {onUpdateImage.isPending ? 'Updating...' : 'Update'}
              </Button>
            )}

            {mode === 'delete' && (
              <Button
                onClick={() => handleDeleteRequest(deleteAction, deleteImageIndex)}
                disabled={onDeleteImage.isPending}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
              >
                {onDeleteImage.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white/95 dark:bg-black/95 backdrop-blur-xl border-2 border-red-300 dark:border-red-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Confirm Delete
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700 dark:text-gray-300">
              {pendingDeleteAction?.action === 'caption' && 'Are you sure you want to delete this image caption?'}
              {pendingDeleteAction?.action === 'image' && 'Are you sure you want to delete this image? This action cannot be undone.'}
              {pendingDeleteAction?.action === 'all' && `Are you sure you want to delete all ${images.length} image(s)? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
