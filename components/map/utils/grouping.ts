import { Cluster, NearbyUser } from "@/types";

const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const groupUsers = (users: NearbyUser[], threshold = 50): Cluster[] => {
  const clusters: Cluster[] = [];

  users.forEach((user) => {
    let foundCluster = null;

    for (let cluster of clusters) {
      const distance = getDistance(
        user.latitude,
        user.longitude,
        cluster.latitude,
        cluster.longitude
      );
      if (distance <= threshold) {
        foundCluster = cluster;
        break;
      }
    }

    if (foundCluster) {
      foundCluster.users.push(user);
      // Update centroid
      foundCluster.latitude =
        foundCluster.users.reduce((sum, u) => sum + u.latitude, 0) /
        foundCluster.users.length;
      foundCluster.longitude =
        foundCluster.users.reduce((sum, u) => sum + u.longitude, 0) /
        foundCluster.users.length;
    } else {
      clusters.push({
        latitude: user.latitude,
        longitude: user.longitude,
        users: [user],
      });
    }
  });

  return clusters;
};
