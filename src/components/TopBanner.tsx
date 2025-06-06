'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Globe, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BannerConfig {
  text: string
  url: string
  isEnabled: boolean
}

interface BannerConfigs {
  en: BannerConfig
  zh: BannerConfig
  nl: BannerConfig
  de: BannerConfig
}

const defaultBannerConfigs: BannerConfigs = {
  en: {
    text: "🎮 Get the best game currency deals at GMYGM - Safe & Fast delivery!",
    url: "https://www.gmygm.com",
    isEnabled: true
  },
  zh: {
    text: "🎮 在GMYGM获取最优惠的游戏货币 - 安全快速交付！",
    url: "https://www.gmygm.com",
    isEnabled: true
  },
  nl: {
    text: "🎮 Krijg de beste game valuta deals bij GMYGM - Veilig & Snelle levering!",
    url: "https://www.gmygm.com",
    isEnabled: true
  },
  de: {
    text: "🎮 Holen Sie sich die besten Spiele Währung Angebote bei GMYGM - Sicher & Schnelle Lieferung!",
    url: "https://www.gmygm.com",
    isEnabled: true
  }
}

interface TopBannerProps {
  locale: string
  isAdmin?: boolean
}

export function TopBanner({ locale, isAdmin = false }: TopBannerProps) {
  const [bannerConfigs, setBannerConfigs] = useState<BannerConfigs>(defaultBannerConfigs)
  const [showEditor, setShowEditor] = useState(false)
  const [editingConfig, setEditingConfig] = useState<BannerConfig>({ text: '', url: '', isEnabled: true })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('banner-configs')
      if (saved) {
        try {
          setBannerConfigs(JSON.parse(saved))
        } catch {
          setBannerConfigs(defaultBannerConfigs)
        }
      }
    }
  }, [])

  const currentConfig = bannerConfigs[locale as keyof BannerConfigs] || bannerConfigs.en

  const saveBannerConfig = (langCode: string, config: BannerConfig) => {
    const newConfigs = { ...bannerConfigs, [langCode]: config }
    setBannerConfigs(newConfigs)
    localStorage.setItem('banner-configs', JSON.stringify(newConfigs))
    setShowEditor(false)
  }

  const openEditor = (langCode: string) => {
    setEditingConfig(bannerConfigs[langCode as keyof BannerConfigs] || defaultBannerConfigs.en)
    setShowEditor(true)
  }

  if (!currentConfig.isEnabled) {
    return null
  }

  return (
    <>
      <div className="bg-blue-600 text-white py-2 px-4 relative">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex-1 text-center">
            <a
              href={currentConfig.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="hover:text-blue-200 transition-colors inline-flex items-center text-sm md:text-base"
            >
              {currentConfig.text}
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </div>

          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditor(locale)}
              className="text-white hover:bg-blue-700 p-1"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 横条编辑器 */}
      {showEditor && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-bold mb-4">Edit Top Banner</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Text
                </label>
                <textarea
                  value={editingConfig.text}
                  onChange={(e) => setEditingConfig({ ...editingConfig, text: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Enter banner display text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link URL
                </label>
                <input
                  type="url"
                  value={editingConfig.url}
                  onChange={(e) => setEditingConfig({ ...editingConfig, url: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={editingConfig.isEnabled}
                  onChange={(e) => setEditingConfig({ ...editingConfig, isEnabled: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isEnabled" className="text-sm text-gray-700">
                  Enable this banner
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowEditor(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => saveBannerConfig(locale, editingConfig)}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function LanguageSelector({ currentLocale }: { currentLocale: string }) {
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ]

  const [showDropdown, setShowDropdown] = useState(false)

  const currentLang = languages.find(lang => lang.code === currentLocale) || languages[0]

  const handleLanguageChange = (langCode: string) => {
    // 在实际部署中，这里应该使用next-intl的路由功能
    // 现在简单地重新加载页面并设置locale参数
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set('locale', langCode)
    window.location.href = newUrl.toString()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors p-2"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm">{currentLang.flag} {currentLang.name}</span>
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[150px]">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                handleLanguageChange(lang.code)
                setShowDropdown(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 ${
                lang.code === currentLocale ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
