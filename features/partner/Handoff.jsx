import TrackedLink from './Track';
import { CtaBand } from '@/components';
import { partnerHandoff } from '@/lib/content';

const handoffMeta = ({ label, intent }) => ({ location: 'handoff', label, intent });

export default function Handoff() {
  const { headline, actions } = partnerHandoff;
  return <CtaBand headline={headline} actions={actions} link={TrackedLink} meta={handoffMeta} />;
}
