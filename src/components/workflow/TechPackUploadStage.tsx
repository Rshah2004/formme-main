import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkflow } from '@/context/WorkflowContext';
import { 
  Upload, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  CheckCircle,
  File,
  X,
  AlertCircle
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TechPackUploadStageProps {
  design: any;
}

const TechPackUploadStage = ({ design }: TechPackUploadStageProps) => {
  const { setCurrentStage, markStageComplete } = useWorkflow();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(design?.tech_pack_url || null);

  useEffect(() => {
    const hydrateTechPack = async () => {
      if (!design?.id) return;
      const { data, error } = await supabase
        .from('designs')
        .select('tech_pack_url')
        .eq('id', design.id)
        .maybeSingle();
      if (error) {
        console.error('Failed to fetch tech pack url:', error);
        return;
      }
      if (data?.tech_pack_url) {
        setUploadedUrl(data.tech_pack_url);
      }
    };

    hydrateTechPack();
  }, [design?.id]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to upload files');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${design.id}/tech-pack-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('designs')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('designs')
        .getPublicUrl(fileName);

      // Update design with tech pack URL
      await supabase
        .from('designs')
        .update({ tech_pack_url: urlData.publicUrl })
        .eq('id', design.id);

      setUploadedUrl(urlData.publicUrl);
      toast.success('Tech pack uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload tech pack');
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  }, [design.id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024 // 50MB
  });


  const handleContinueWithUpload = () => {
    markStageComplete('upload-tech-pack');
    setCurrentStage('design');
  };

  const handleGenerateTechPack = () => {
    markStageComplete('upload-tech-pack');
    setCurrentStage('design');
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadedUrl(null);
  };

  const hasExistingTechPack = uploadedUrl || design?.tech_pack_url;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Upload Your Tech Pack
              </h1>
              <p className="text-muted-foreground text-lg">
                Have an existing tech pack? Upload it here to get matched with manufacturers right away.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload Tech Pack
          </CardTitle>
          <CardDescription>
            Upload your tech pack document (PDF, DOC, DOCX, or images). Max 50MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasExistingTechPack ? (
            <div className="border border-primary/30 bg-primary/5 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {uploadedFile?.name || 'Tech Pack Uploaded'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {uploadedFile ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Ready for manufacturer matching'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={uploadedUrl || design?.tech_pack_url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={removeFile}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}
                ${isUploading ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  {isUploading ? (
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground mb-1">
                    {isDragActive ? 'Drop your tech pack here' : 'Drag & drop your tech pack'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse (PDF, DOC, DOCX, PNG, JPG)
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Continue Button */}
      {hasExistingTechPack && (
        <div className="flex justify-end">
          <Button size="lg" onClick={handleContinueWithUpload} className="gap-2">
            Design Details
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Divider */}
      <div className="relative py-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-sm text-muted-foreground">
            Don't have a tech pack?
          </span>
        </div>
      </div>

      {/*/!* Generate Tech Pack Option *!/*/}
      {/*<Card className="border-border hover:border-primary/30 transition-colors">*/}
      {/*  <CardContent className="p-6">*/}
      {/*    <div className="flex items-center justify-between">*/}
      {/*      <div className="flex items-center gap-4">*/}
      {/*        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">*/}
      {/*          <Sparkles className="w-7 h-7 text-purple-500" />*/}
      {/*        </div>*/}
      {/*        <div>*/}
      {/*          <h3 className="text-lg font-semibold text-foreground mb-1">*/}
      {/*            Create Tech Pack with Our Generator*/}
      {/*          </h3>*/}
      {/*          <p className="text-muted-foreground">*/}
      {/*            We'll guide you through creating a complete tech pack step by step*/}
      {/*          </p>*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*      <Button variant="outline" onClick={handleGenerateTechPack} className="gap-2">*/}
      {/*        Generate Tech Pack*/}
      {/*        <ArrowRight className="w-4 h-4" />*/}
      {/*      </Button>*/}
      {/*    </div>*/}
      {/*  </CardContent>*/}
      {/*</Card>*/}

      {/*/!* What's included in tech pack *!/*/}
      {/*<Card className="border-border bg-muted/30">*/}
      {/*  <CardHeader>*/}
      {/*    <CardTitle className="text-base flex items-center gap-2">*/}
      {/*      <AlertCircle className="w-4 h-4 text-muted-foreground" />*/}
      {/*      What should your tech pack include?*/}
      {/*    </CardTitle>*/}
      {/*  </CardHeader>*/}
      {/*  <CardContent>*/}
      {/*    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">*/}
      {/*      {[*/}
      {/*        'Product name and description',*/}
      {/*        'Technical sketches or flat drawings',*/}
      {/*        'Size specifications and measurements',*/}
      {/*        'Fabric type and composition',*/}
      {/*        'Color codes (Pantone/hex)',*/}
      {/*        'Construction details',*/}
      {/*        'Label and tag placement',*/}
      {/*        'Print/embroidery specifications'*/}
      {/*      ].map((item, index) => (*/}
      {/*        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">*/}
      {/*          <CheckCircle className="w-4 h-4 text-primary/60 shrink-0" />*/}
      {/*          {item}*/}
      {/*        </li>*/}
      {/*      ))}*/}
      {/*    </ul>*/}
      {/*  </CardContent>*/}
      {/*</Card>*/}
    </div>
  );
};

export default TechPackUploadStage;
