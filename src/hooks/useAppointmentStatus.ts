import { useMutation } from "@apollo/client/react";
import { Alert } from "react-native";
import { UPDATE_APPOINTMENT_STATUS } from "../graphql/mutations/mutations";
import { AppointmentStatus } from "../types/types";

export const useAppointmentStatus = () => {
  const [updateAppointmentStatus, { loading, error }] = useMutation<any>(
    UPDATE_APPOINTMENT_STATUS
  );

  const updateStatus = (
    id: string,
    newStatus: AppointmentStatus,
    onSuccess?: () => void
  ) => {
    updateAppointmentStatus({
      variables: {
        input: {
          id,
          status: newStatus,
        },
      },
      optimisticResponse: {
        updateAppointmentStatus: {
          __typename: "Appointment",
          id: id,
          status: newStatus,
        },
      },
      update: (cache, { data: { updateAppointmentStatus } }) => {
        // Optimistic update handles the UI immediately
      },
      onCompleted: () => {
        if (onSuccess) onSuccess();
      },
      onError: (err) => {
        Alert.alert("Error", "Failed to update status: " + err.message);
      },
    });
  };

  return {
    updateStatus,
    loading,
    error,
  };
};
