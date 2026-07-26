import type { TimelineItem } from "../models/TimelineItem";

type DialogDetailProps = {
    entry: TimelineItem;
    onClose: () => void;
};

export const DialogDetail = ({ entry, onClose }: DialogDetailProps) => {
    return (
        <>
            <button className="absolute top-4 right-4" onClick={onClose}>
                Close
            </button>
            <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-lime-50">{entry.title}</h2>
                <p className="text-sm text-slate-200/85">{entry.date}</p>
                <p className="text-sm text-slate-200/85">{entry.type}</p>
            </div>
            <button
                className="absolute top-4 right-4 text-sm text-lime-50 hover:text-lime-200"
                onClick={onClose}
            >
                Close
            </button>
        </>
    )
}