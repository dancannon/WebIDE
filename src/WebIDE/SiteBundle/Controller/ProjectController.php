<?php
namespace WebIDE\SiteBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use WebIDE\SiteBundle\Entity\ProjectVersion;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use WebIDE\SiteBundle\Entity\File;
use WebIDE\SiteBundle\Entity\Project;
use WebIDE\SiteBundle\Entity\OwnableEntity;
use FOS\RestBundle\View\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use JMS\SecurityExtraBundle\Annotation\Secure;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class ProjectController extends Controller
{
    public function getProjectsAction()
    {
        $this->checkPermission();

        $em = $this->getDoctrine()->getManager();
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p JOIN p.files f JOIN p.version pv JOIN f.version fv WHERE fv.id = pv AND p.user = :user");
        $query->setParameter("user", $this->get('security.context')->getToken()->getUser());

        $projects = $query->getResult();

        $view = View::create()
            ->setStatusCode(200)
            ->setData($projects);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    /**
     * @Rest\Route("/projects/recent")
     */
    public function getRecentProjectsAction()
    {
        $this->checkPermission();

        $em = $this->getDoctrine()->getManager();
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p JOIN p.files f JOIN p.version pv JOIN f.version fv WHERE fv.id = pv AND p.user = :user ORDER BY p.updated DESC");
        $query->setMaxResults(5);
        $query->setParameter("user", $this->get('security.context')->getToken()->getUser());

        $projects = $query->execute();

        $view = View::create()
            ->setStatusCode(200)
            ->setData($projects);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function getProjectAction($id)
    {
        $em = $this->getDoctrine()->getManager();
        $query = $em->createQuery("
            SELECT p, f
            FROM WebIDESiteBundle:Project p
            LEFT JOIN p.files f
                WITH f.version = p.version
            WHERE p.id = :id
        ");
        $query->setParameter("id", $id);

        $project = $query->getResult();

        if (!$project || !isset($project[0])) {
            throw $this->createNotFoundException('Project not found.');
        }


        $project = $project[0];
        $project->setCurrentVersion($project->getVersion()->getVersionNumber());

        $this->checkPermission($project);

        $view = View::create()
            ->setStatusCode(200)
            ->setData($project);

        return $this->get('fos_rest.view_handler')->handle($view);
    }


    /**
     * @Rest\Get("/projects/{id}/{version}", requirements={"version" = "\d+", "id" = "\d+"})
     */
    public function getProjectVersionAction($id, $version)
    {
        $em = $this->getDoctrine()->getManager();

        // Find version
        $query = $em->createQuery("SELECT v FROM WebIDESiteBundle:ProjectVersion v WHERE v.versionNumber = :versionNumber AND v.project = :id");
        $query->setParameter("id", $id);
        $query->setParameter("versionNumber", $version);
        $version = $query->getResult();

        if (!$version || !isset($version[0])) {
            throw $this->createNotFoundException('Project not found.');
        }

        $version = $version[0];

        //Find project
        $query = $em->createQuery("
            SELECT p, f
            FROM WebIDESiteBundle:Project p
            LEFT JOIN p.files f
                WITH f.version = :version
            WHERE p.id = :id AND :version MEMBER OF p.versions
        ");
        $query->setParameter("id", $id);
        $query->setParameter("version", $version);
        $project = $query->getResult();

        if (!$project || !isset($project[0])) {
            throw $this->createNotFoundException('Project not found.');
        }

        $project = $project[0];
        $project->setCurrentVersion($version->getVersionNumber());

        $this->checkPermission($project);

        $view = View::create()
            ->setStatusCode(200)
            ->setData($project);

        return $this->get('fos_rest.view_handler')->handle($view);
    }


    /**
     * @Rest\Get("/projects/{id}/version")
     */
    public function newProjectVersionAction($id)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new HttpException(403, "Unauthorized");
        }

        // Fetch the project from the database
        $em = $this->getDoctrine()->getManager();
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p LEFT JOIN p.files f WITH f.version = p.version WHERE p.id = :id");
        $query->setParameter("id", $id);

        $project = $query->getResult();

        if (!$project || !isset($project[0])) {
            throw $this->createNotFoundException('Project not found.');
        }

        $project = $project[0];

        // Create the new version
        $version = new ProjectVersion();
        $version->setVersionNumber($project->getVersion()->getVersionNumber());
        $version->incVersionNumber();

        // Clone each file and set its version to the new version
        $newFiles = array();
        foreach($project->getFiles() as $file) {
            // If the file is not of the same version as the current version skip file
            if($file->getVersion() && $file->getVersion()->getId() !== $project->getVersion()->getId()) {
                continue;
            }

            $newFile = new File();

            $newFile->setActive($file->isActive());
            $newFile->setSelected($file->isSelected());
            $newFile->setResource($file->isResource());
            $newFile->setOrder($file->getOrder());
            $newFile->setType($file->getType());
            $newFile->setName($file->getName());
            $newFile->setContent($file->getContent());
            $newFile->setProject($project);
            $newFile->setVersion($version);
            $newFile->setUser($this->get('security.context')->getToken()->getUser());

            $newFiles[] = $newFile;
        }

        $project->setFiles($newFiles);
        $project->setVersion($version);

        $em->persist($project);
        $em->flush();

        // Set the current version of the project (Not stored in db)
        $project->setCurrentVersion($project->getVersion()->getVersionNumber());

        $this->checkPermission($project);

        $view = View::create()
            ->setStatusCode(200)
            ->setData($project);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    /**
     * @Rest\Get("/projects/{id}/download")
     */
    public function downloadProjectAction($id)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new HttpException(403, "Unauthorized");
        }

        $em = $this->getDoctrine()->getManager();
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p LEFT JOIN p.files f WITH f.version = p.version WHERE p.id = :id");
        $query->setParameter("id", $id);

        $project = $query->getResult();

        if (!$project || !isset($project[0])) {
            throw $this->createNotFoundException('Project not found.');
        }

        $file = "/home/daniel/download.zip";

        $headers = array(
            'Content-Description'        => 'File Transfer',
            'Content-Disposition'        => 'inline; attachment; filename=' . basename($file),
            'Content-Type'               => 'application/zip',
            'Content-Transfer-Encoding:' => 'binary',
        );

        return new Response(file_get_contents($file), 200, $headers);
    }

    public function postProjectsAction()
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new HttpException(403, "Unauthorized");
        }

        $em = $this->getDoctrine()->getManager();

        $project = new Project();
        $project->setUser($this->get('security.context')->getToken()->getUser());
        $project = $this->createProjectFromRequest($project);

        //TODO: Add validation

        $em->persist($project);
        $em->flush();

        $project->setCurrentVersion($project->getVersion()->getVersionNumber());

        $this->checkPermission($project);

        $view = View::create()
            ->setStatusCode(200)
            ->setData($project);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function putProjectAction($id)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new HttpException(403, "Unauthorized");
        }

        $em = $this->getDoctrine()->getManager();
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p LEFT JOIN p.files f WITH f.version = p.version WHERE p.id = :id");
        $query->setParameter("id", $id);

        $project = $query->getResult();

        if (!$project || !isset($project[0])) {
            throw $this->createNotFoundException('Project not found.');
        }

        $project = $project[0];
        $project = $this->createProjectFromRequest($project);

        //TODO: Add validation

        $em->persist($project);
        $em->flush();

        $project->setCurrentVersion($project->getVersion()->getVersionNumber());

        $this->checkPermission($project);

        $view = View::create()
            ->setStatusCode(200)
            ->setData($project);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function deleteProjectAction($id)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new HttpException(403, "Unauthorized");
        }

        $em = $this->getDoctrine()->getManager();
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p LEFT JOIN p.files f WITH f.version = p.version WHERE p.id = :id");
        $query->setParameter("id", $id);

        $project = $query->getResult();

        if (!$project || !isset($project[0])) {
            throw $this->createNotFoundException('Project not found.');
        }

        $project = $project[0];

        $this->checkPermission($project);

        // Delete user
        $em->remove($project);
        $em->flush();

        $view = View::create()
            ->setStatusCode(200);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    protected function createProjectFromRequest(Project $project, $newVersion = false)
    {
        $em = $this->getDoctrine()->getManager();
        $request = $this->getRequest();
        $version = $project->getVersion();

        // Create the new version
        if(!$version) {
            $version = new ProjectVersion();
        } else {
            // If the current version is not the same as the db project then create a new version
            $versionRequest = $request->get("current_version", $project->getVersion()->getVersionNumber());
            if ($project->getVersion()->getVersionNumber() !== $versionRequest) {
                $version = new ProjectVersion();
                $version->setVersionNumber($project->getVersion()->getVersionNumber());
                $version->incVersionNumber();

                $newVersion = true;
            }
        }

        //Init hash
        $hash = hash_init("md5");

        //Create files
        $files = array();
        foreach ($request->get('files', array()) as $fileData) {
//            if(is_array($fileData)) {
            // If a new version is requested create a new file
            if($newVersion) $file = new File();

            // Fetch the file from the db
            if(isset($fileData['id'])) {
                $file = $this->getDoctrine()->getRepository("WebIDESiteBundle:File")->find(array('id' => $fileData['id']));

                // If the file is not of the same version as the current version skip file
                if($file->getVersion() && $file->getVersion()->getId() !== $project->getVersion()->getId()) {
                    continue;
                }
            }

            // If the file is still not created then create it now
            if(!isset($file) || !$file) {
                $file = new File();
            }

            $file->setActive($fileData['active']);
            $file->setSelected($fileData['selected']);
            $file->setResource($fileData['resource']);
            $file->setOrder($fileData['order']);
            $file->setType($fileData['type']);
            $file->setName($fileData['name']);
            $file->setContent($fileData['content']);
            $file->setProject($project);
            $file->setVersion($project->getVersion());
            $file->setUser($this->get('security.context')->getToken()->getUser());
//            } else {
//                $file = $this->getDoctrine()->getRepository("WebIDESiteBundle:File")->find(array('id' => $fileData));
//            }

            $files[] = $file;

            //Update hash
            hash_update($hash, $file->getContent());
            $em->persist($file);
        }

        $project->setHash(hash_final($hash));
        $project->setVersion($version);

        return $project;
    }

    protected function checkPermission(OwnableEntity $entity=null)
    {
        if($entity !== null) {
            if(!$this->get('security.context')->isGranted('ROLE_USER')) {
                throw new HttpException(401, "Unauthorized");
            }
            if($this->get('security.context')->getToken()->getUser() !== $entity->getUser()) {
                throw new HttpException(403, "Unauthorized");
            }

            return true;
        } else {
            if(!$this->get('security.context')->isGranted('ROLE_USER')) {
                throw new HttpException(401, "Unauthorized");
            }

            return true;
        }
    }
}