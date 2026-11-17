// Prints the CGWindowID of the largest on-screen window owned by a process whose
// pid is in the given list. Usage: swift window_id.swift <pid> [<pid> ...]
import CoreGraphics
import Foundation

let pids = Set(CommandLine.arguments.dropFirst().compactMap { Int32($0) })
guard let list = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] else { exit(1) }
var best: (id: Int, area: Double)? = nil
for w in list {
  guard let pid = w[kCGWindowOwnerPID as String] as? Int32, pids.contains(pid),
        (w[kCGWindowLayer as String] as? Int) == 0,
        let b = w[kCGWindowBounds as String] as? [String: Double],
        let id = w[kCGWindowNumber as String] as? Int else { continue }
  let area = (b["Width"] ?? 0) * (b["Height"] ?? 0)
  if area > (best?.area ?? 0) { best = (id, area) }
}
if let best = best { print(best.id) } else { exit(2) }
