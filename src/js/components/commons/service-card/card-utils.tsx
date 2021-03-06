import { Avatar } from "@mui/material";
import { Service } from "js/model";

export const getServiceAvatar = (service: Service) => {
    const img = service.logo;
    return (
        <span className={`etat-service ${getColorClassStateService()}`}>
            <span className="bordure-carte">
                <Avatar src={img} className="service-avatar" />
            </span>
        </span>
    );
};

export const getTitle = (service: Service) =>
    (service?.env as any)?.["onyxia.friendlyName"] ?? service?.name ?? "";

export const getSubtitle = (service: Service) =>
    service.subtitle ||
    (service && service.labels && service.labels.ONYXIA_SUBTITLE) ||
    "";

const getColorClassStateService = () => "running";
