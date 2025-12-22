/**
 * 文件上传按钮组件
 * 支持点击上传和拖拽上传
 */
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import React, { useCallback, useState } from 'react';
import { useLexiangUpload } from '@/hooks/services/useLexiangUpload';
import { PostLexiangUploadBodyMediaType } from '@/types/api';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

interface UploadButtonProps {
  /** 知识库 ID */
  spaceId: string;
  /** 父节点 ID（可选） */
  parentId?: string;
  /** 上传成功回调 */
  onSuccess?: () => void;
}

/**
 * 根据文件类型获取媒体类型
 */
const getMediaType = (file: File): PostLexiangUploadBodyMediaType => {
  const mimeType = file.type;

  if (mimeType.startsWith('video/')) {
    return PostLexiangUploadBodyMediaType.video;
  }

  if (mimeType.startsWith('audio/')) {
    return PostLexiangUploadBodyMediaType.audio;
  }

  // 默认为文件类型
  return PostLexiangUploadBodyMediaType.file;
};

/**
 * 文件上传按钮
 */
const UploadButton: React.FC<UploadButtonProps> = ({ spaceId, parentId, onSuccess }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { mutateAsync: uploadFile, isPending } = useLexiangUpload();

  // 自定义上传逻辑
  const customRequest: UploadProps['customRequest'] = useCallback(
    async (options) => {
      const { file, onSuccess: onUploadSuccess, onError, onProgress } = options;
      const fileObj = file as File;

      try {
        // 模拟上传进度
        onProgress?.({ percent: 30 });

        // 调用上传 hook
        await uploadFile({
          file: fileObj,
          mediaType: getMediaType(fileObj),
          spaceId,
          parentId,
        });

        onProgress?.({ percent: 100 });
        onUploadSuccess?.(null);

        // 清空文件列表
        setFileList([]);

        // 触发成功回调
        onSuccess?.();
      } catch (error) {
        onError?.(error as Error);
      }
    },
    [uploadFile, spaceId, parentId, onSuccess],
  );

  // 文件列表变化
  const handleChange: UploadProps['onChange'] = useCallback(({ fileList: newFileList }) => {
    setFileList(newFileList);
  }, []);

  // 移除文件
  const handleRemove: UploadProps['onRemove'] = useCallback(() => {
    setFileList([]);
    return true;
  }, []);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    customRequest,
    onChange: handleChange,
    onRemove: handleRemove,
    showUploadList: {
      showRemoveIcon: true,
    },
  };

  return (
    <Upload {...uploadProps}>
      <Button type="primary" icon={<UploadOutlined />} loading={isPending}>
        上传文件
      </Button>
    </Upload>
  );
};

export default UploadButton;
