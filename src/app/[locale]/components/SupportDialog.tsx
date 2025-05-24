import { Mail, MessageCircle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';

type SupportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SupportDialog({
  isOpen,
  onClose,
}: SupportDialogProps) {
  const t = useTranslations('support');
  const locale = useLocale();
  const isRTL = locale === 'fa';

  const handleEmailSupport = () => {
    window.location.href = 'mailto:support@coinchat.com';
    onClose();
  };

  const handleTelegramSupport = () => {
    window.open('https://t.me/coinchat_support', '_blank');
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="dark:bg-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl dark:text-gray-100">
            {t('needHelp')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base dark:text-gray-300">
            {t('chooseSupport')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className={`flex h-14 items-center ${isRTL ? 'flex-row-reverse' : ''} gap-2 text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600`}
            onClick={handleEmailSupport}
          >
            <Mail className="size-5" />
            <span>{t('emailSupport')}</span>
          </Button>
          <Button
            variant="outline"
            className={`flex h-14 items-center ${isRTL ? 'flex-row-reverse' : ''} gap-2 text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600`}
            onClick={handleTelegramSupport}
          >
            <MessageCircle className="size-5" />
            <span>{t('telegramSupport')}</span>
          </Button>
        </div>
        <AlertDialogFooter className={`${isRTL ? 'flex-row-reverse' : ''}`}>
          <AlertDialogCancel className="dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">
            {t('close')}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
