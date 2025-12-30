'use client'

import { useState } from 'react'
import { uploadAvatar, deleteAvatar } from '@/app/account/actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, X } from 'lucide-react'

interface AvatarUploadProps {
  currentAvatarUrl: string | undefined
}

export default function AvatarUpload({ currentAvatarUrl }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB')
      return
    }

    setUploading(true)

    try {
      const result = await uploadAvatar(file)

      if (result.error) {
        toast.error(result.error)
      } else {
        setAvatarUrl(result.data?.avatar_url || '')
        toast.success('Avatar updated successfully')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteAvatar = async () => {
    if (!avatarUrl) return

    setUploading(true)

    try {
      const result = await deleteAvatar()

      if (result.error) {
        toast.error(result.error)
      } else {
        setAvatarUrl('')
        toast.success('Avatar removed')
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-6">
      <div className="relative group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl || '/default-avatar.png'}
          alt="Profile avatar"
          className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
        />
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('avatar-upload')?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload New
          </Button>

          {avatarUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDeleteAvatar}
              disabled={uploading}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-500">
          Upload a profile picture. Maximum file size: 2MB.
          Supported formats: JPG, PNG, GIF.
        </p>
      </div>

      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
    </div>
  )
}
