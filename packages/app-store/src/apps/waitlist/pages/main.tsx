import { WaitlistTable } from "../table/table";
import { WaitlistTableAction } from "../table/table-action";

export const WaitlistPage: React.FC<{ appId: string }> = ({ appId }) => {
  return (
    <div className="flex flex-col flex-1 gap-8">
      <WaitlistTableAction appId={appId} />
      <WaitlistTable appId={appId} />
    </div>
  );
};
