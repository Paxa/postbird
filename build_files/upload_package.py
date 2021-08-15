import subprocess
import glob
import os

types = ('*.dmg', '*.deb', '*.rpm', '*.snap', '*.exe', '*.zip', '*.AppImage', '*.pacman', '*.apk', '*.js', '*.json')

packages = []

for ext in types:
    packages.extend(glob.glob("dist/" + ext))

print(packages)

if len(packages) > 0:

    commited_at = os.environ.get('COMMITTED_AT')
    git_branch = os.environ.get('GITHUB_BASE_REF')
    commit_ref = os.environ.get('GITHUB_SHA')

    releaase_folder = "%s-%s-%s" % (commited_at, git_branch, commit_ref[0:8])

    b2_appkey_id = os.environ.get('B2_APPKEY_ID')
    b2_appkey = os.environ.get('B2_APPKEY')
    b2_bucket = os.environ.get('B2_BUCKET')

    os.system("b2 authorize-account %s %s" % (b2_appkey_id, b2_appkey))

    for file in packages:
        upload_path = releaase_folder + "/" + os.path.basename(file)
        print("Upload %s to %s" % (file, upload_path))
        os.system("b2 upload-file %s %s %s" % (b2_bucket, file, upload_path))
