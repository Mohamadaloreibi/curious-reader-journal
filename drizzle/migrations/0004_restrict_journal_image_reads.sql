ALTER POLICY journal_images_public_read ON storage.objects
TO anon, authenticated
USING (
  bucket_id = 'journal-images'
  AND EXISTS (
    SELECT 1 FROM public.journal_articles AS article
    WHERE article.status = 'published'
      AND (
        article.cover_image = 'journal-images/' || storage.objects.name
        OR article.og_image = 'journal-images/' || storage.objects.name
      )
  )
);
CREATE POLICY journal_images_admin_read ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'journal-images'
  AND public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
);
COMMENT ON POLICY journal_images_public_read ON storage.objects IS 'Only images explicitly referenced as cover or sharing images by published articles are reader-accessible; draft and unreferenced uploads remain private.';