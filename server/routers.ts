import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getUserFiles, createFile, deleteFile } from "./db";
import { storagePut, storageGet } from "./storage";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // 檔案存儲路由
  files: router({
    // 取得用戶檔案清單
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserFiles(ctx.user.id);
    }),

    // 上傳檔案
    upload: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        mimeType: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // 解碼 base64 檔案數據
          const buffer = Buffer.from(input.fileData, 'base64');
          const fileSize = buffer.length;

          // 上傳到 S3
          const fileKey = `${ctx.user.id}/files/${Date.now()}-${input.fileName}`;
          const { url } = await storagePut(fileKey, buffer, input.mimeType);

          // 儲存檔案中績資訊到數據庫
          await createFile({
            userId: ctx.user.id,
            fileName: input.fileName,
            fileKey,
            fileUrl: url,
            mimeType: input.mimeType,
            fileSize,
            description: input.description,
          });

          return { success: true, url };
        } catch (error) {
          console.error('[Files] Upload failed:', error);
          throw error;
        }
      }),

    // 删除檔案
    delete: protectedProcedure
      .input(z.object({ fileId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const success = await deleteFile(input.fileId, ctx.user.id);
        return { success };
      }),
  }),
});

export type AppRouter = typeof appRouter;
