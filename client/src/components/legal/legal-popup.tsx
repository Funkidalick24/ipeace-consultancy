import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TermsOfService } from './terms-of-service';
import { PrivacyPolicy } from './privacy-policy';

interface LegalPopupProps {
  type: 'terms' | 'privacy';
  children: React.ReactNode;
}

export const LegalPopup = memo(function LegalPopup({ type, children }: LegalPopupProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const getTitle = () => {
    return type === 'terms'
      ? t('footer.terms')
      : t('footer.privacy');
  };

  const getContent = () => {
    return type === 'terms'
      ? <TermsOfService />
      : <PrivacyPolicy />;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{getTitle()}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {getContent()}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)} aria-label={t('legal.close')}>
            {t('legal.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});