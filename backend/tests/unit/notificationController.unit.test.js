const Notification = require("../../models/Notification");
const {
  getMyNotifications,
  markAsRead,
  deleteNotification
} = require("../../controllers/notificationController");

// Mock Notification model
jest.mock("../../models/Notification");

describe("Notification Controller Unit Tests", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ 1. Get notifications
  it("should return notifications for logged-in user", async () => {
    const req = {
      user: { _id: "user123" }
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    Notification.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        { message: "Booking confirmed" }
      ])
    });

    await getMyNotifications(req, res);

    expect(Notification.find).toHaveBeenCalledWith({ userId: "user123" });
    expect(res.json).toHaveBeenCalled();
  });

  // ✅ 2. Mark as read
  it("should mark notification as read", async () => {
    const req = {
      params: { id: "notif123" }
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    Notification.findByIdAndUpdate.mockResolvedValue({
      isRead: true
    });

    await markAsRead(req, res);

    expect(Notification.findByIdAndUpdate).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  // ✅ 3. Delete notification
  it("should delete notification", async () => {
    const req = {
      params: { id: "notif123" }
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    Notification.findByIdAndDelete.mockResolvedValue({});

    await deleteNotification(req, res);

    expect(Notification.findByIdAndDelete).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });
});
