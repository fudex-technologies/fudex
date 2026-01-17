import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useVendorApprovalActions = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    // Upload verification document
    const uploadDocumentMutation = useMutation(
        trpc.vendors.uploadVerificationDocument.mutationOptions({
            onSuccess: () => {
                toast.success('Document uploaded successfully');
                // Invalidate using queryClient manually until useUtils matches known pattern
                // Trying standard tRPC key pattern
                queryClient.invalidateQueries({
                    queryKey: [['vendors', 'getVendorOnboardingProgress']]
                });
            },
            onError: (error) => {
                toast.error(error.message || 'Failed to upload document');
            },
        })
    );

    // Submit for approval
    const submitForApprovalMutation = useMutation(
        trpc.vendors.submitForApproval.mutationOptions({
            onSuccess: () => {
                toast.success('Application submitted for approval!');
                queryClient.invalidateQueries({
                    queryKey: [['vendors', 'getVendorOnboardingProgress']]
                });
                // Optionally redirect or refresh
            },
            onError: (error) => {
                toast.error(error.message || 'Failed to submit application');
            },
        })
    );

    return {
        uploadDocument: (url: string) => uploadDocumentMutation.mutateAsync({ documentUrl: url }),
        isUploading: uploadDocumentMutation.isPending,

        submitForApproval: () => submitForApprovalMutation.mutateAsync(),
        isSubmitting: submitForApprovalMutation.isPending,
    };
};
